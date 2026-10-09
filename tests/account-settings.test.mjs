import test from 'node:test';
import assert from 'node:assert/strict';
import {loadServices,fakeClient} from './service-loader.mjs';
test('troca de senha valida entrada antes de confirmar credenciais',async()=>{
 const client=fakeClient();let signIns=0,updates=0;
 client.auth.signInWithPassword=async()=>{signIns++;return {error:null};};client.auth.updateUser=async()=>{updates++;return {error:null};};
 const {exports}=await loadServices(client,'src/lib/accountSettings.ts');
 for(const args of [['','long-password','long-password'],['old','short','short'],['old','long-password','different'],['same-password','same-password','same-password']])await assert.rejects(exports.changeAccountPassword('test@example.invalid',...args));
 assert.equal(signIns,0);assert.equal(updates,0);
 await exports.changeAccountPassword('test@example.invalid','old-password','new-password','new-password');assert.equal(signIns,1);assert.equal(updates,1);
});
test('senha atual incorreta impede atualização; falha ao atualizar não vira sucesso',async()=>{
 const client=fakeClient();let updates=0;
 client.auth.signInWithPassword=async()=>({error:{message:'invalid'}});client.auth.updateUser=async()=>{updates++;return {error:null};};
 const {exports}=await loadServices(client,'src/lib/accountSettings.ts');
 await assert.rejects(exports.changeAccountPassword('test@example.invalid','old-password','new-password','new-password'));assert.equal(updates,0);
 client.auth.signInWithPassword=async()=>({error:null});client.auth.updateUser=async()=>({error:{message:'blocked'}});await assert.rejects(exports.changeAccountPassword('test@example.invalid','old-password','new-password','new-password'));
});
test('dados da clínica alteram apenas nome e endereço com filtro obrigatório de clínica',async()=>{
 const client=fakeClient([{data:{id:'clinic',name:'Nova clínica',location:'Rua 1'},error:null}]);const {exports}=await loadServices(client,'src/lib/accountSettings.ts');
 await exports.saveClinicSettings('clinic',' Nova clínica ',' Rua 1 ');
 const update=client.calls.find(c=>c[0]==='update')[1];assert.deepEqual(Object.keys(update).sort(),['location','name']);assert.equal(update.name,'Nova clínica');assert.ok(client.calls.some(c=>c[0]==='eq'&&c[1]==='id'&&c[2]==='clinic'));
 await assert.rejects(exports.saveClinicSettings('clinic','x','Rua'));await assert.rejects(exports.saveClinicSettings('clinic','Nova clínica','Rua'));
});
test('foto com formato ou tamanho inválido é rejeitada antes da leitura',async()=>{
 const {exports}=await loadServices(fakeClient(),'src/lib/accountSettings.ts');
 await assert.rejects(exports.prepareProfilePhoto(new File(['x'],'photo.svg',{type:'image/svg+xml'})));
 await assert.rejects(exports.prepareProfilePhoto(new File([new Uint8Array(6*1024*1024)],'photo.png',{type:'image/png'})));
});
