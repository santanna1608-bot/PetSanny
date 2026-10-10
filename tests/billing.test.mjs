import test from 'node:test';
import assert from 'node:assert/strict';
import {checkoutPayload,safeCheckoutLink,checkoutLink,billingConfig,validWebhookToken,billingOwner} from '../server/billing.js';
import {normalizedPayment,processAsaasEvent} from '../server/asaasEvents.js';
test('checkout aceita somente plano do catalogo e valor definido no servidor',()=>{
 const body=checkoutPayload('crescer','order','https://petsanny.vercel.app',new Date('2026-10-09T12:00:00Z'));
 assert.equal(body.items[0].value,197);assert.deepEqual(body.chargeTypes,['RECURRENT']);assert.equal(body.subscription.cycle,'MONTHLY');
 assert.equal(body.externalReference,'order');assert.throws(()=>checkoutPayload('invasor','x','https://petsanny.vercel.app'));
 assert.throws(()=>checkoutPayload('essencial','x','http://example.invalid'));
});
test('producao usa apenas chave e endpoint de producao e exige habilitacao explicita',()=>{
 const env={VITE_SUPABASE_URL:'https://example.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-secret',ASAAS_WEBHOOK_TOKEN:'x'.repeat(40),ASAAS_API_KEY:'sandbox',ASAAS_PRODUCTION_API_KEY:'production'};
 const config=billingConfig(env);assert.equal(config.environment,'production');assert.equal(config.key,'production');assert.equal(config.api,'https://api.asaas.com/v3');assert.equal(config.enabled,false);
 assert.equal(billingConfig({...env,ASAAS_ENVIRONMENT:'sandbox'}).key,'sandbox');assert.equal(billingConfig({...env,ASAAS_PRODUCTION_ENABLED:'true'}).enabled,true);
 assert.equal(billingConfig({...env,ASAAS_ENVIRONMENT:'invalid'}),null);assert.equal(billingConfig({...env,ASAAS_ENVIRONMENT:'production',ASAAS_PRODUCTION_API_KEY:''}),null);
});
test('checkout funciona com identificador apenas e separa destinos de producao e testes',()=>{
 const link=checkoutLink('checkout-123','production');assert.equal(link,'https://asaas.com/checkoutSession/show?id=checkout-123');assert.equal(safeCheckoutLink(link,'production'),true);assert.equal(safeCheckoutLink(link),false);
 assert.equal(safeCheckoutLink('https://sandbox.asaas.com/checkoutSession/show?id=123','production'),false);
 for(const bad of ['https://asaas.com.evil.invalid/checkoutSession/show?id=123','https://user@asaas.com/checkoutSession/show?id=123','https://asaas.com/checkoutSession/show','https://asaas.com:444/checkoutSession/show?id=123'])assert.equal(safeCheckoutLink(bad,'production'),false);
 assert.throws(()=>checkoutLink('../unsafe','production'));
});
test('pagamento precisa corresponder ao valor e assinatura e descarta dados sensiveis',()=>{
 const p={id:'pay_1',subscription:'sub_1',value:197,dueDate:'2026-10-10',status:'CONFIRMED',creditCard:{creditCardToken:'never-store'},cpfCnpj:'never-store'};
 const order={amount:197,subscription_id:'sub_1'};assert.equal(normalizedPayment(p,order).p_status,'CONFIRMED');assert.equal(JSON.stringify(normalizedPayment(p,order)).includes('never-store'),false);
 for(const patch of [{value:97},{subscription:'sub_other'},{dueDate:'invalid'},{subscription:null}])assert.throws(()=>normalizedPayment({...p,...patch},order));
 assert.equal(normalizedPayment({...p,deleted:true},order).p_status,'DELETED');
});
test('evento atrasado consulta o Asaas e persiste estado atual de estorno',async()=>{
 const oldFetch=globalThis.fetch;const calls=[];
 globalThis.fetch=async(url)=>{assert.equal(url,'https://api.asaas.com/v3/payments/pay_1');return {ok:true,json:async()=>({id:'pay_1',subscription:'sub_1',value:97,dueDate:'2026-10-10',status:'REFUNDED'})};};
 const query={select(){return this;},eq(){return this;},async maybeSingle(){return {data:{id:'order_1',amount:97,subscription_id:'sub_1'}};}};
 try{await processAsaasEvent({environment:'production',api:'https://api.asaas.com/v3',key:'not-logged',db:{from:()=>query,rpc:async(name,args)=>{calls.push({name,args});return {error:null};}}},{id:'event_1',event:'PAYMENT_CONFIRMED',payment:{id:'pay_1',status:'CONFIRMED'}});assert.equal(calls[0].args.p_status,'REFUNDED');assert.equal(calls[0].name,'process_asaas_payment');}finally{globalThis.fetch=oldFetch;}
});
test('pagamento anterior ao checkout nao bloqueia a fila sequencial nem concede acesso',async()=>{
 const oldFetch=globalThis.fetch;const calls=[];globalThis.fetch=async()=>({ok:true,json:async()=>({id:'pay_1',subscription:'sub_1'})});
 const query={select(){return this;},eq(){return this;},async maybeSingle(){return {data:null};}};
 try{await processAsaasEvent({environment:'production',api:'https://api.asaas.com/v3',key:'not-logged',db:{from:()=>query,rpc:async(name,args)=>{calls.push({name,args});return {error:null};}}},{id:'event_2',event:'PAYMENT_CREATED',payment:{id:'pay_1'}});assert.equal(calls.length,1);assert.equal(calls[0].name,'record_unmatched_asaas_event');assert.equal(calls[0].args.p_order_id,undefined);}finally{globalThis.fetch=oldFetch;}
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
