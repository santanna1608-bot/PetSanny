import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
export async function loadServices(client,entry='src/lib/supabaseClient.ts') {
  const context=vm.createContext({console,Map,Date,Error,Promise,Object,URL,File,setTimeout,clearTimeout,crypto:globalThis.crypto});
  let storageWrites=0;
  context.localStorage={getItem:()=>null,setItem:()=>{storageWrites++;},clear:()=>{storageWrites++;},removeItem:()=>{storageWrites++;}};
  const cache=new Map();
  async function load(file) {
    if(cache.has(file))return cache.get(file);
    if(file==='@supabase/supabase-js'){
      const sdk=new vm.SyntheticModule(['createClient'],function(){this.setExport('createClient',()=>client);},{context});cache.set(file,sdk);return sdk;
    }
    const source=await fs.readFile(file,'utf8');
    const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
    const module=new vm.SourceTextModule(compiled,{context,identifier:file,initializeImportMeta(meta){meta.env={VITE_SUPABASE_URL:'https://example.supabase.co',VITE_SUPABASE_ANON_KEY:'test-public-key'};}});
    cache.set(file,module);
    await module.link(async(specifier,owner)=>{
      if(specifier==='@supabase/supabase-js')return load(specifier);
      const base=path.resolve(path.dirname(owner.identifier),specifier);
      return load(path.extname(base)?base:`${base}.ts`);
    });return module;
  }
  const module=await load(path.resolve(entry));await module.evaluate();
  return {exports:module.namespace,storageWrites:()=>storageWrites};
}
export function fakeClient(results=[]) {
  const calls=[];
  const client={calls,auth:{signOut:async()=>{calls.push(['signOut']);return {error:null};}},rpc:async(name,args)=>{calls.push(['rpc',name,args]);return results.shift()||{data:null,error:null};},from(table){
    calls.push(['from',table]);
    const query={};for(const method of ['select','eq','in','insert','update','delete','order','range'])query[method]=(...args)=>{calls.push([method,...args]);return query;};
    query.single=async()=>results.shift()||{data:null,error:null};
    query.then=(resolve,reject)=>Promise.resolve(results.shift()||{data:[],error:null}).then(resolve,reject);
    return query;
  }};return client;
}
