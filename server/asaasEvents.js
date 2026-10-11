import { asaasRequest } from './billing.js';
export const checkoutEvents=['CHECKOUT_PAID','CHECKOUT_CANCELED','CHECKOUT_EXPIRED'];
export const subscriptionEvents=['SUBSCRIPTION_CREATED','SUBSCRIPTION_UPDATED','SUBSCRIPTION_INACTIVATED','SUBSCRIPTION_DELETED'];
export const paymentEvents=['PAYMENT_CREATED','PAYMENT_UPDATED','PAYMENT_CONFIRMED','PAYMENT_RECEIVED','PAYMENT_OVERDUE','PAYMENT_DELETED','PAYMENT_RESTORED','PAYMENT_REFUNDED','PAYMENT_PARTIALLY_REFUNDED','PAYMENT_REFUND_IN_PROGRESS','PAYMENT_REFUND_DENIED','PAYMENT_CHARGEBACK_REQUESTED','PAYMENT_CHARGEBACK_DISPUTE','PAYMENT_AWAITING_CHARGEBACK_REVERSAL','PAYMENT_RECEIVED_IN_CASH_UNDONE'];
export function normalizedPayment(payment,order,environment='production') {
 // O simulador de atraso do Sandbox antecipa dueDate e mantém o vencimento
 // contratual em originalDueDate. A cobertura deve acompanhar a mensalidade original.
 if(environment==='sandbox'&&payment.originalDueDate)payment={...payment,dueDate:payment.originalDueDate};
 if(typeof payment.id!=='string'||!payment.id||payment.id.length>200||typeof payment.status!=='string'||!payment.status||payment.status.length>80||!/^\d{4}-\d{2}-\d{2}$/.test(payment.dueDate)||Number(payment.value)!==Number(order.amount)||typeof payment.subscription!=='string'||!payment.subscription||payment.subscription.length>200||order.subscription_id&&order.subscription_id!==payment.subscription)throw Error('INCONSISTENT_PAYMENT');
 // Nenhum dado de cartão, token ou documento é armazenado.
 return {p_payment_id:payment.id,p_subscription_id:payment.subscription,p_amount:Number(payment.value),p_status:payment.deleted?'DELETED':payment.status,p_due_date:payment.dueDate};
}
async function record(config,order,payment,id,event) {
 const args=normalizedPayment(payment,order,config.environment);
 const saved=await config.db.rpc('process_asaas_payment',{p_environment:config.environment,p_event_id:id,p_event:event,p_order_id:order.id,...args});
 if(saved.error)throw Error('PERSIST_FAILED');
}
export async function processAsaasEvent(config,body) {
 const {id,event,checkout,payment,subscription}=body;
 if(subscriptionEvents.includes(event)) {
  if(typeof subscription?.id!=='string'||!subscription.id||subscription.id.length>200)throw Error('INVALID_EVENT');
  const current=await asaasRequest(config,'/subscriptions/'+encodeURIComponent(subscription.id));
  if(current.id!==subscription.id||!['ACTIVE','INACTIVE','EXPIRED'].includes(current.status)&&!current.deleted)throw Error('INCONSISTENT_SUBSCRIPTION');
  const found=await config.db.from('billing_orders').select('id,amount,subscription_id').eq('environment',config.environment).eq('subscription_id',current.id).maybeSingle();
  if(found.error)throw Error('LOOKUP_FAILED');
  const saved=found.data?await config.db.rpc('process_asaas_subscription',{p_environment:config.environment,p_event_id:id,p_event:event,p_subscription_id:current.id,p_status:current.deleted?'DELETED':current.status}):await config.db.rpc('record_unmatched_asaas_event',{p_environment:config.environment,p_event_id:id,p_event:event});
  if(saved.error)throw Error('PERSIST_FAILED');
  return;
 }
 if(checkoutEvents.includes(event)) {
  if(typeof checkout?.id!=='string'||checkout.id.length>200)throw Error('INVALID_EVENT');
  const found=await config.db.from('billing_orders').select('id,amount,subscription_id,created_at').eq('environment',config.environment).eq('checkout_id',checkout.id).maybeSingle();
  if(found.error||!found.data)throw Error('ORDER_NOT_READY');
  if(event==='CHECKOUT_PAID') {
   let list=await asaasRequest(config,'/payments?checkoutSession='+encodeURIComponent(checkout.id)+'&limit=100');
   if(Array.isArray(list.data)&&list.data.some(p=>p.checkoutSession!==checkout.id))throw Error('INCONSISTENT_PAYMENT');
   if(Array.isArray(list.data)&&list.data.length===0&&!list.hasMore) {
    // Alternativa restrita à referência opaca do pedido; nunca conciliar por nome ou valor apenas.
    list=await asaasRequest(config,'/payments?externalReference='+encodeURIComponent(found.data.id)+'&limit=100');
    if(!Array.isArray(list.data)||list.data.some(p=>p.externalReference!==found.data.id))throw Error('INCONSISTENT_PAYMENT');
   }
   if(Array.isArray(list.data)&&list.data.length===0&&!list.hasMore) {
    // O Sandbox pode retornar vazio no filtro direto mesmo com checkoutSession presente.
    // Consulta limitada por data; somente o identificador exato permite conciliação.
    if(typeof found.data.created_at!=='string'||!/^\d{4}-\d{2}-\d{2}/.test(found.data.created_at))throw Error('RECONCILIATION_REQUIRED');
    const matched=[];
    let complete=false;
    for(let page=0;page<5;page++) {
     const recent=await asaasRequest(config,'/payments?dateCreated%5Bge%5D='+found.data.created_at.slice(0,10)+'&limit=100&offset='+page*100);
     if(!Array.isArray(recent.data)||typeof recent.hasMore!=='boolean')throw Error('PAYMENT_LIST_INVALID');
     matched.push(...recent.data.filter(p=>p.checkoutSession===checkout.id));
     if(!recent.hasMore){complete=true;break;}
    }
    if(!complete)throw Error('PAYMENT_LIST_INCOMPLETE');
    list={data:matched,hasMore:false};
   }
   if(!Array.isArray(list.data))throw Error('PAYMENT_LIST_INVALID');
   if(list.hasMore)throw Error('PAYMENT_LIST_INCOMPLETE');
   if(!list.data.length)throw Error('CHECKOUT_PAYMENTS_NOT_FOUND');
   // Validar todo o lote antes da primeira gravação, inclusive a assinatura única.
   for(const p of list.data)normalizedPayment(p,found.data,config.environment);
   if(new Set(list.data.map(p=>p.subscription)).size!==1)throw Error('INCONSISTENT_SUBSCRIPTION');
   for(const p of list.data)await record(config,found.data,p,id+':'+p.id,event);
   const subscriptions=[...new Set(list.data.map(p=>p.subscription))];
   for(const subscriptionId of subscriptions)await processAsaasEvent(config,{id:id+':subscription:'+subscriptionId,event:'SUBSCRIPTION_UPDATED',subscription:{id:subscriptionId}});
  }
  const saved=await config.db.rpc('process_asaas_checkout',{p_environment:config.environment,p_event_id:id,p_checkout_id:checkout.id,p_event:event});
  if(saved.error)throw Error('PERSIST_FAILED');
  return;
 }
 if(paymentEvents.includes(event)) {
  if(typeof payment?.id!=='string'||payment.id.length>200)throw Error('INVALID_EVENT');
  // Reconsulta estado atual: notificação atrasada não desfaz um estorno posterior.
  const current=await asaasRequest(config,'/payments/'+encodeURIComponent(payment.id));
  if(!current.subscription)return; // Cobranças avulsas da conta Asaas não pertencem ao SaaS.
  const found=await config.db.from('billing_orders').select('id,amount,subscription_id').eq('environment',config.environment).eq('subscription_id',current.subscription).maybeSingle();
  if(found.error)throw Error('LOOKUP_FAILED');
  if(!found.data) {
   // PAYMENT_CREATED precede CHECKOUT_PAID em envio sequencial. Não bloqueie a fila:
   // a conciliação do checkout consulta o estado atual de todas as suas cobranças.
   const saved=await config.db.rpc('record_unmatched_asaas_event',{p_environment:config.environment,p_event_id:id,p_event:event});
   if(saved.error)throw Error('PERSIST_FAILED');
   return;
  }
  await record(config,found.data,current,id,event);
 }
}
