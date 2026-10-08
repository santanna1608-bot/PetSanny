import test from 'node:test';
import assert from 'node:assert/strict';
import {loadServices,fakeClient} from './service-loader.mjs';
const account={id:'user',email:'user@example.invalid',email_confirmed_at:'2026-10-08',user_metadata:{name:'Nome',tenant_id:'other-clinic',is_super_admin:true}};
test('acesso vem dos vínculos do banco e ignora privilégios do metadata',async()=>{
  const client=fakeClient([{data:[{tenant_id:'own-clinic',role:'viewer'}],error:null}]);const {exports}=await loadServices(client,'src/lib/authAccess.ts');
  const user=await exports.resolveUser(account);assert.equal(user.memberships[0].tenant_id,'own-clinic');assert.equal(user.is_super_admin,false);
  assert.ok(client.calls.some(c=>c[0]==='eq'&&c[1]==='user_id'&&c[2]==='user'));
});
test('clínica só é criada pela RPC após confirmação do email',async()=>{
  const client=fakeClient([{data:[],error:null},{data:{id:'clinic'},error:null},{data:[{tenant_id:'clinic',role:'owner'}],error:null}]);const {exports}=await loadServices(client,'src/lib/authAccess.ts');
  const user=await exports.resolveUser({...account,user_metadata:{name:'Nome',clinic_draft:{tenantName:'Clínica',tenantLocation:'Rua',plan:'Gold'}}});
  assert.equal(user.memberships[0].role,'owner');assert.ok(client.calls.some(c=>c[0]==='rpc'&&c[1]==='bootstrap_tenant'));assert.ok(!client.calls.some(c=>c[0]==='insert'));
});
test('usuário não confirmado não cria clínica automaticamente',async()=>{
  const client=fakeClient([{data:[],error:null}]);const {exports}=await loadServices(client,'src/lib/authAccess.ts');
  await exports.resolveUser({...account,email_confirmed_at:null,user_metadata:{clinic_draft:{tenantName:'Clínica'}}});
  assert.ok(!client.calls.some(c=>c[0]==='rpc'));
});
test('falha no cadastro da clínica não é convertida em acesso bem-sucedido',async()=>{
  const error={message:'bootstrap failed'};const client=fakeClient([{data:[],error:null},{data:null,error}]);const {exports}=await loadServices(client,'src/lib/authAccess.ts');
  await assert.rejects(exports.resolveUser({...account,user_metadata:{clinic_draft:{tenantName:'Clínica'}}}),e=>e===error);
});
test('eventos concorrentes compartilham leitura de acesso sem criar clínica duplicada',async()=>{
  const client=fakeClient([{data:[{tenant_id:'clinic',role:'owner'}],error:null}]);const {exports}=await loadServices(client,'src/lib/authAccess.ts');
  await Promise.all([exports.resolveUser(account),exports.resolveUser(account)]);
  assert.equal(client.calls.filter(c=>c[0]==='from').length,1);
});
test('logout preserva dados locais e propaga falhas do serviço de autenticação',async()=>{
  const client=fakeClient();const loaded=await loadServices(client,'src/lib/authAccess.ts');
  await loaded.exports.signOut();assert.equal(loaded.storageWrites(),0);
  const error={message:'logout failed'};client.auth.signOut=async()=>({error});await assert.rejects(loaded.exports.signOut(),e=>e===error);
});
