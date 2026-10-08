import test from 'node:test';
import assert from 'node:assert/strict';
import {loadServices,fakeClient} from './service-loader.mjs';
test('novo atendimento usa operação atômica e recebe tutor e pet vinculados',async()=>{
  const result={id:'appointment',tenant_id:'clinic',tutor_id:'tutor',pet_id:'pet'};
  const client=fakeClient([{data:[result],error:null}]); const {exports}=await loadServices(client);
  const created=await exports.appointmentsService.create({tenant_id:'clinic',tutor_name:'Tutor',pet_name:'Pet'});
  assert.equal(created.pet_id,'pet');assert.equal(client.calls[0][1],'save_appointment_with_contacts');
  assert.ok(!client.calls.some(c=>c[0]==='insert'));
});
test('falha na operação atômica não anuncia atendimento salvo',async()=>{
  const error={message:'pet rejected'};const client=fakeClient([{data:null,error}]);const loaded=await loadServices(client);
  await assert.rejects(loaded.exports.appointmentsService.create({tenant_id:'clinic'}),e=>e===error);
  assert.equal(loaded.storageWrites(),0);
});
test('falha remota de cadastro é propagada e não grava fallback local',async()=>{
  const error={message:'RLS blocked'};const client=fakeClient([{data:null,error}]);const loaded=await loadServices(client);
  await assert.rejects(loaded.exports.tutorsService.create({tenant_id:'clinic-a',name:'Tutor',email:null,phone:null}),e=>e===error);
  assert.equal(loaded.storageWrites(),0);
});
test('leitura mantém filtro de clínica e retorna erro sem dados fictícios',async()=>{
  const error={message:'offline'};const client=fakeClient([{data:null,error}]);const loaded=await loadServices(client);
  await assert.rejects(loaded.exports.petsService.list('clinic-a'),e=>e===error);
  assert.ok(client.calls.some(c=>c[0]==='eq'&&c[1]==='tenant_id'&&c[2]==='clinic-a'));assert.equal(loaded.storageWrites(),0);
});
test('exclusão bloqueada por RLS não anuncia sucesso',async()=>{
  const client=fakeClient([{data:[],error:null}]);const {exports}=await loadServices(client);
  await assert.rejects(exports.tutorsService.delete('id'),/não encontrado/);
});
test('concluir agendamento preserva timestamp de confirmação',async()=>{
  const client=fakeClient([{data:{id:'id',status:'completed',confirmed_at:'previous'},error:null}]);const {exports}=await loadServices(client);
  await exports.appointmentsService.updateStatus('id','completed');
  const update=client.calls.find(c=>c[0]==='update')[1];assert.equal(update.status,'completed');assert.equal('confirmed_at' in update,false);
});
test('consulta de prontuário filtra pet e clínica no servidor',async()=>{
  const client=fakeClient([{data:[],error:null}]);const {exports}=await loadServices(client,'src/lib/domainServices.ts');
  await exports.medicalService.list('clinic-a',{pet_id:'pet-a'});
  assert.ok(client.calls.some(c=>c[0]==='eq'&&c[1]==='pet_id'&&c[2]==='pet-a'));
  assert.ok(client.calls.some(c=>c[0]==='eq'&&c[1]==='tenant_id'&&c[2]==='clinic-a'));
});
test('upload com tipo inválido não chama Storage',async()=>{
  const client=fakeClient();const {exports}=await loadServices(client,'src/lib/domainServices.ts');
  await assert.rejects(exports.uploadPetDocument('clinic','pet',new File(['html'],'attack.html',{type:'text/html'})),/PDF/);assert.equal(client.calls.length,0);
});
test('upload compensa arquivo novo se gravação de metadados falhar',async()=>{
  const error={message:'metadata write failed'};const client=fakeClient([{data:null,error}]);let removed;
  client.storage={from:()=>({upload:async()=>({error:null}),remove:async(paths)=>{removed=paths;return {error:null};}})};
  const {exports}=await loadServices(client,'src/lib/domainServices.ts');
  await assert.rejects(exports.uploadPetDocument('clinic','pet',new File(['pdf'],'report.pdf',{type:'application/pdf'})),e=>e===error);
  assert.equal(removed.length,1);assert.match(removed[0],/^clinic\/pet\/.*\.pdf$/);
});
