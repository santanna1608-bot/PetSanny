import test from 'node:test';
import assert from 'node:assert/strict';
import {checkoutPayload,safeCheckoutLink,validWebhookToken,billingOwner} from '../server/billing.js';
test('checkout aceita somente plano do catalogo e valor definido no servidor',()=>{
 const body=checkoutPayload('crescer','order','https://petsanny.vercel.app',new Date('2026-10-09T12:00:00Z'));
 assert.equal(body.items[0].value,197);assert.deepEqual(body.chargeTypes,['RECURRENT']);assert.equal(body.subscription.cycle,'MONTHLY');
 assert.equal(body.externalReference,'order');assert.throws(()=>checkoutPayload('invasor','x','https://petsanny.vercel.app'));
 assert.throws(()=>checkoutPayload('essencial','x','http://example.invalid'));
});
test('checkout nunca redireciona para producao ou dominio externo',()=>{
 assert.equal(safeCheckoutLink('https://sandbox.asaas.com/checkoutSession/show/123'),true);
 for(const url of ['https://asaas.com/checkoutSession/show/123','https://sandbox.asaas.com.evil.invalid/checkoutSession/show/123','http://sandbox.asaas.com/checkoutSession/show/123','javascript:alert(1)'])assert.equal(safeCheckoutLink(url),false);
});
test('webhook sem segredo forte ou com token incorreto e rejeitado',()=>{
 const secret='s'.repeat(40);assert.equal(validWebhookToken(secret,secret),true);
 assert.equal(validWebhookToken('errado',secret),false);assert.equal(validWebhookToken(secret,''),false);assert.equal(validWebhookToken(undefined,secret),false);assert.equal(validWebhookToken('curto','curto'),false);
});
test('cobranca nao confia no tenant informado sem vinculo autenticado',async()=>{
 let queried=false;const db={auth:{getUser:async()=>({data:{user:null},error:Error('invalid')})},from:()=>{queried=true;}};
 assert.equal(await billingOwner({method:'GET',headers:{authorization:'Bearer invalid'},query:{tenantId:'50000000-0000-4000-8000-000000000011'}},db),null);assert.equal(queried,false);
});
