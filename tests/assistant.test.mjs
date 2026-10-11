import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyRequest, assistantText, routeRequest } from '../server/assistant.js';
test('incerteza não executa rota de dados',async()=>{
 assert.equal(await classifyRequest('pedido','fake',async()=>({ok:true,json:async()=>({answers:{rota:{type:'choice',choice:'agenda',confidence:0.3}}})})),'fora');
});
test('respostas inválidas e falha do provedor não viram respostas inventadas',async()=>{
 for(const response of [{ok:false},{ok:true,json:async()=>({answers:{rota:{type:'choice',choice:'delete',confidence:1}}})}])await assert.rejects(classifyRequest('pedido','fake',async()=>response));
});
test('Jev recebe somente pedido, nunca dados da clínica',()=>{
 assert.deepEqual(routeRequest('agenda').state,{pedido:'agenda'});
 assert.equal(routeRequest('agenda').model,'jev-latest');
});
test('resumo conserva números e mensagem exige revisão sem envio',()=>{
 assert.match(assistantText('agenda',{total:4,confirmed:1,pending:1,completed:1,canceled:1}),/4 atendimentos/);
 assert.match(assistantText('mensagem'),/Nenhuma mensagem foi enviada/);
});
