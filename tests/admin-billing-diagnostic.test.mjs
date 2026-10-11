import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const orderId='e308c91f-28e5-4841-95d4-257a40233f1a';
async function run({admin=true,method='GET',token='Bearer test',environment='sandbox',order=orderId,malformed=false,action,orderStatus='paid',reconcileSandbox=true,reconcileFails=false}={}) {
 const calls=[];const filters=[];
 const context=vm.createContext({process:{env:{VITE_SUPABASE_URL:'https://test.supabase.co',VITE_SUPABASE_ANON_KEY:'public'}},encodeURIComponent});
 const query={select(){return this;},eq(k,v){filters.push([k,v]);return this;},async maybeSingle(){return {data:{id:orderId,checkout_id:'checkout_1',amount:97,created_at:'2026-10-10T12:00:00Z',status:orderStatus}};}};
 const auth=new vm.SyntheticModule(['createClient'],function(){this.setExport('createClient',()=>({rpc:async()=>({data:admin})}));},{context});
 const billing=new vm.SyntheticModule(['billingConfig','asaasRequest'],function(){this.setExport('billingConfig',()=>({environment,reconcileSandbox,db:{from:()=>query}}));this.setExport('asaasRequest',async(_config,path)=>{calls.push(path);return malformed?{data:null}:{hasMore:false,data:[{id:'pay_private',checkoutSession:'checkout_1',externalReference:orderId,subscription:'sub_private',customer:'private',cpfCnpj:'private',creditCard:{token:'secret'}}]};});},{context});
 const events=new vm.SyntheticModule(['processAsaasEvent'],function(){this.setExport('processAsaasEvent',async(_config,event)=>{calls.push(event);if(reconcileFails)throw Error('secret');});},{context});
 const module=new vm.SourceTextModule(await readFile(new URL('../api/admin-billing-diagnostic.js',import.meta.url),'utf8'),{context});await module.link(name=>name.includes('supabase')?auth:name.includes('asaasEvents')?events:billing);await module.evaluate();
 const res={code:200,setHeader(){},status(code){this.code=code;return this;},json(body){this.body=body;return this;}};
 await module.namespace.default({method,headers:{authorization:token},query:{orderId:order},body:{action,orderId:order}},res);
 return {code:res.code,body:JSON.parse(JSON.stringify(res.body)),calls,filters};
}
test('diagnostico recusa contas de clinica e resultados ambiguos antes de consultar Asaas',async()=>{for(const admin of [false,null,'true']){const r=await run({admin});assert.equal(r.code,403);assert.equal(r.calls.length,0);}});
test('diagnostico exige sessao, metodo permitido e pedido valido e fica restrito ao Sandbox',async()=>{for(const [options,status] of [[{token:null},401],[{method:'DELETE'},405],[{method:'POST'},400],[{environment:'production'},409],[{order:'invalido'},400]]){const r=await run(options);assert.equal(r.code,status);assert.equal(r.calls.length,0);}});
test('diagnostico devolve somente contagens e verifica vinculos exatos sem expor payload',async()=>{const r=await run();assert.equal(r.code,200);assert.deepEqual(r.filters,[['id',orderId],['environment','sandbox']]);assert.equal(r.calls.length,4);assert.ok(r.calls[1].startsWith('/lean/payments?checkoutSession=checkout_1'));assert.ok(r.calls[3].includes('dateCreated%5Bge%5D=2026-10-10'));assert.equal(r.body.checkout.exactCheckout,1);assert.equal(r.body.recent.exactReference,1);assert.equal(r.body.recent.complete,true);assert.equal(JSON.stringify(r.body).includes('private'),false);assert.equal(JSON.stringify(r.body).includes('secret'),false);});
test('resposta malformada do Asaas nao produz diagnostico de sucesso',async()=>{const r=await run({malformed:true});assert.equal(r.code,502);assert.equal(r.body.checkout,undefined);});
test('reprocessamento usa pipeline existente somente para Sandbox pago e administrador',async()=>{
 const r=await run({method:'POST',action:'reconcile'});assert.equal(r.code,200);assert.equal(r.body.reconciled,true);assert.equal(r.calls.length,1);assert.equal(r.calls[0].event,'CHECKOUT_PAID');assert.equal(r.calls[0].checkout.id,'checkout_1');
 for(const options of [{admin:false},{environment:'production'},{orderStatus:'active'},{reconcileSandbox:false}]){const denied=await run({method:'POST',action:'reconcile',...options});assert.ok([403,409].includes(denied.code));assert.equal(denied.calls.length,0);}
 const failed=await run({method:'POST',action:'reconcile',reconcileFails:true});assert.equal(failed.code,502);assert.equal(JSON.stringify(failed.body).includes('secret'),false);
});
