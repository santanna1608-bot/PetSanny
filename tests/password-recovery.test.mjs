import test from 'node:test';
import assert from 'node:assert/strict';
import {loadServices,fakeClient} from './service-loader.mjs';
test('recuperação usa retorno específico e propaga falhas de envio',async()=>{
 const client=fakeClient();let request;
 client.auth.resetPasswordForEmail=async(...args)=>{request=args;return {error:null};};
 const {exports}=await loadServices(client,'src/lib/passwordRecovery.ts');
 await exports.requestPasswordRecovery(' test@example.invalid ','http://localhost:5174');
 assert.equal(request[0],'test@example.invalid');assert.equal(request[1].redirectTo,'http://localhost:5174/?flow=recovery');
 const error={message:'rate limit'};client.auth.resetPasswordForEmail=async()=>({error});
 await assert.rejects(exports.requestPasswordRecovery('test@example.invalid','http://localhost:5174'),e=>e===error);
});
test('senha inválida ou diferente não é enviada ao servidor; erros não viram sucesso',async()=>{
 const client=fakeClient();let updates=0;
 client.auth.updateUser=async()=>{updates++;return {error:null};};
 const {exports}=await loadServices(client,'src/lib/passwordRecovery.ts');
 await assert.rejects(exports.saveRecoveredPassword('short','short'));await assert.rejects(exports.saveRecoveredPassword('long-password','different-password'));
 assert.equal(updates,0);await exports.saveRecoveredPassword('long-password','long-password');assert.equal(updates,1);
 const error={message:'expired'};client.auth.updateUser=async()=>({error});await assert.rejects(exports.saveRecoveredPassword('long-password','long-password'),e=>e===error);
});
