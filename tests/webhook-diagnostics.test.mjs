import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

async function invoke({config=null,failure,legacyError=false}={}) {
 const logs=[];
 const context=vm.createContext({console:{error:(...args)=>logs.push(args)}});
 const source=await readFile(new URL('../api/asaas-webhook.js',import.meta.url),'utf8');
 const billing=new vm.SyntheticModule(['billingConfig','validWebhookToken'],function(){
  this.setExport('billingConfig',()=>config);
  this.setExport('validWebhookToken',()=>true);
 },{context});
 const events=new vm.SyntheticModule(['processAsaasEvent','checkoutEvents','paymentEvents','subscriptionEvents'],function(){
  this.setExport('processAsaasEvent',async()=>{if(failure)throw Error(failure);});
  this.setExport('checkoutEvents',['CHECKOUT_PAID']);
  this.setExport('paymentEvents',[]);
  this.setExport('subscriptionEvents',[]);
 },{context});
 const module=new vm.SourceTextModule(source,{context});
 await module.link(specifier=>specifier.endsWith('billing.js')?billing:events);
 await module.evaluate();
 const response={statusCode:200,setHeader(){},status(code){this.statusCode=code;return this;},json(body){this.body=body;return this;},end(){return this;}};
 if(config)config.db={rpc:async()=>({error:legacyError?{}:null})};
 await module.namespace.default({method:'POST',headers:{},body:{id:'evt_test',event:'CHECKOUT_PAID',checkout:{id:'checkout_test'}}},response);
 return {response,logs};
}

test('configuração ausente informa código fixo sem expor ambiente',async()=>{
 const {response}=await invoke();
 assert.equal(response.statusCode,503);
 assert.equal(response.body.error,'BILLING_NOT_CONFIGURED');
});
test('erro conhecido de conciliação fica identificável no webhook',async()=>{
 const {response,logs}=await invoke({config:{environment:'sandbox',reconcileSandbox:true},failure:'PERSIST_FAILED'});
 assert.equal(response.statusCode,503);
 assert.equal(response.body.error,'PERSIST_FAILED');
 assert.equal(logs[0][1],'PERSIST_FAILED');
});
test('mensagem arbitrária com segredo nunca vai à resposta nem ao log',async()=>{
 const {response,logs}=await invoke({config:{environment:'sandbox',reconcileSandbox:true},failure:'token=segredo-do-provedor'});
 assert.equal(response.body.error,'RECONCILIATION_FAILED');
 assert.equal(JSON.stringify([response.body,logs]).includes('segredo-do-provedor'),false);
});
test('falha de persistência do caminho legado também retorna diagnóstico',async()=>{
 const {response}=await invoke({config:{environment:'sandbox',reconcileSandbox:false},legacyError:true});
 assert.equal(response.statusCode,503);
 assert.equal(response.body.error,'PERSIST_FAILED');
});
