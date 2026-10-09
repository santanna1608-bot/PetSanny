import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
async function run({admin=true,error=null,token='Bearer test',method='GET'}={}){
 const env={VITE_SUPABASE_URL:'https://test.supabase.co',VITE_SUPABASE_ANON_KEY:'public',ASAAS_API_KEY:'secret-not-exposed',SUPABASE_SERVICE_ROLE_KEY:'private-not-exposed',ASAAS_WEBHOOK_TOKEN:'x'.repeat(40)};
 let checked=false;const context=vm.createContext({process:{env}});
 const dependency=new vm.SyntheticModule(['createClient'],function(){this.setExport('createClient',(_url,_key,options)=>{assert.equal(options.global.headers.Authorization,token);return {rpc:async(name)=>{checked=true;assert.equal(name,'current_platform_admin');return {data:admin,error};}};});},{context});
 const module=new vm.SourceTextModule(await readFile(new URL('../api/admin-status.js',import.meta.url),'utf8'),{context});await module.link(()=>dependency);await module.evaluate();
 const response={code:200,setHeader(){},status(code){this.code=code;return this;},json(body){this.body=body;return this;}};
 await module.namespace.default({method,headers:{authorization:token}},response);return {...response,checked};
}
 test('consulta de configuração exige administrador confirmado pelo servidor',async()=>{for(const admin of [false,null,'true']){const r=await run({admin});assert.equal(r.code,403);assert.equal(r.body.asaasKey,undefined);}assert.equal((await run({error:Error('fail')})).code,403);});
 test('consulta de configuração rejeita ausência de sessão e métodos de escrita',async()=>{const absent=await run({token:null});assert.equal(absent.code,401);assert.equal(absent.checked,false);const write=await run({method:'POST'});assert.equal(write.code,405);assert.equal(write.checked,false);});
 test('administrador recebe apenas indicadores sem valores de segredos',async()=>{const r=await run();assert.equal(r.code,200);assert.equal(r.body.asaasKey,true);assert.equal(r.body.environment,'sandbox');assert.equal(JSON.stringify(r.body).includes('not-exposed'),false);assert.equal(Object.values(r.body).filter(v=>typeof v==='boolean').length,3);});

