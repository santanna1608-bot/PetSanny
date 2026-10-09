import test from 'node:test';
import assert from 'node:assert/strict';
import {loadServices,fakeClient} from './service-loader.mjs';
test('link privado usa token opaco no fragmento e não guarda dados no navegador',async()=>{
 const token='a'.repeat(64);const client=fakeClient([{data:token,error:null}]);const loaded=await loadServices(client,'src/lib/tutorPortal.ts');
 assert.equal(await loaded.exports.issueTutorLink('appointment','https://petsanny.vercel.app'),`https://petsanny.vercel.app/#visit=${token}`);assert.equal(loaded.storageWrites(),0);assert.equal(client.calls[0][1],'issue_appointment_link');
});
test('falha no link não produz URL e pedido de reagendamento chama RPC limitada',async()=>{
 const error={message:'access denied'};const client=fakeClient([{data:null,error}]);const {exports:s}=await loadServices(client,'src/lib/tutorPortal.ts');
 await assert.rejects(s.issueTutorLink('foreign','https://petsanny.vercel.app'),e=>e===error);
 await s.respondTutorAppointment('token','reschedule','2026-10-15','11:00','Preferência');assert.equal(client.calls[1][1],'respond_tutor_appointment');assert.equal(client.calls[1][2].p_date,'2026-10-15');
});
const slot={tenant_id:'a',service_type:'aesthetic',service_name:'Banho',professional_name:'Ana',appointment_date:'2026-10-12',appointment_time:'10:00:00',duration_minutes:60};
const entry={id:'one',tenant_id:'a',status:'waiting',service_type:'aesthetic',service_name:'Banho',professional_name:null,earliest_date:'2026-10-12',latest_date:'2026-10-14',earliest_time:'09:00:00',latest_time:'11:00:00',duration_minutes:60,created_at:'2026-10-09'};
test('retornos vencidos excluem pets já agendados sem misturar clínicas',async()=>{
 const {exports:s}=await loadServices(fakeClient(),'src/lib/carePassport.ts');
 const profiles=[{id:'due',tenant_id:'a',pet_id:'one',next_return_date:'2026-10-08'},{id:'booked',tenant_id:'a',pet_id:'two',next_return_date:'2026-10-08'},{id:'future',tenant_id:'a',pet_id:'three',next_return_date:'2026-10-12'}];
 const appointments=[{tenant_id:'a',pet_id:'two',status:'confirmed',appointment_date:'2026-10-10'},{tenant_id:'b',pet_id:'one',status:'pending',appointment_date:'2026-10-10'}];
 assert.deepEqual(Array.from(s.overdueReturns(profiles,appointments,'2026-10-09'),p=>p.id),['due']);
});
test('fila exige clínica, profissional, período e duração compatíveis',async()=>{
 const {exports:s}=await loadServices(fakeClient(),'src/lib/scheduling.ts');
 const candidates=[entry,{...entry,id:'foreign',tenant_id:'b'},{...entry,id:'professional',professional_name:'Luiz'},{...entry,id:'end',latest_time:'10:30:00'},{...entry,id:'late',earliest_date:'2026-10-13'},{...entry,id:'duration',duration_minutes:90},{...entry,id:'booked',status:'booked'}];
 assert.deepEqual(Array.from(s.matchingWaitlist(candidates,slot),e=>e.id),['one']);
});
test('fila prioriza ordem de cadastro e aceita atendimento terminando no limite',async()=>{
 const {exports:s}=await loadServices(fakeClient(),'src/lib/scheduling.ts');
 assert.deepEqual(Array.from(s.matchingWaitlist([entry,{...entry,id:'older',created_at:'2026-10-08'}],slot),e=>e.id),['older','one']);
});
test('cancelamento requer motivo e falhas remotas são propagadas',async()=>{
 const error={message:'denied'};const client=fakeClient([{error,data:null}]);const {exports:s}=await loadServices(client,'src/lib/scheduling.ts');
 await assert.rejects(s.cancelAppointment('id',' '));assert.equal(client.calls.length,0);
 await assert.rejects(s.cancelAppointment('id',' Tutor pediu '),e=>e===error);assert.equal(client.calls[0][2].p_reason,'Tutor pediu');
});
test('reserva chama operação atômica e não altera fila pelo frontend',async()=>{
 const client=fakeClient([{data:{id:'booked'},error:null}]);const {exports:s}=await loadServices(client,'src/lib/scheduling.ts');
 assert.equal((await s.bookWaitlistEntry('entry','slot')).id,'booked');assert.equal(client.calls.length,1);assert.equal(client.calls[0][1],'book_waitlist_entry');
});
