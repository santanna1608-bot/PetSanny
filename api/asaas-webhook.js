import { billingConfig,validWebhookToken } from '../server/billing.js';
import { processAsaasEvent,checkoutEvents,paymentEvents,subscriptionEvents } from '../server/asaasEvents.js';
export default async function handler(req,res) {
 res.setHeader('Cache-Control','no-store');if(req.method!=='POST')return res.status(405).end();
 const config=billingConfig();if(!config)return res.status(503).json({received:false,error:'BILLING_NOT_CONFIGURED'});
 if(!validWebhookToken(req.headers['asaas-access-token'],config.webhookToken))return res.status(401).end();
 const {id,event}=req.body||{};
 if(typeof id!=='string'||!id||id.length>200||typeof event!=='string')return res.status(400).end();
 if(config.environment==='sandbox'&&!config.reconcileSandbox){
  if(!checkoutEvents.includes(event))return res.json({received:true,ignored:true});
  if(typeof req.body.checkout?.id!=='string')return res.status(400).end();
  const saved=await config.db.rpc('process_sandbox_checkout_event',{p_event_id:id,p_checkout_id:req.body.checkout.id,p_event:event});
  return saved.error?res.status(503).json({received:false,error:'PERSIST_FAILED'}):res.json({received:true});
 }
 if(![...checkoutEvents,...paymentEvents,...subscriptionEvents].includes(event))return res.json({received:true,ignored:true});
 try{await processAsaasEvent(config,req.body);return res.json({received:true});}catch(e){
  const known=['INVALID_EVENT','INCONSISTENT_PAYMENT','INCONSISTENT_SUBSCRIPTION','ORDER_NOT_READY','RECONCILIATION_REQUIRED','PERSIST_FAILED','LOOKUP_FAILED','ASAAS_UNCERTAIN','ASAAS_REJECTED'];
  const code=known.includes(e?.message)?e.message:'RECONCILIATION_FAILED';
  // Apenas código estático: nunca registrar payload, credenciais ou dados do pagador.
  console.error('Asaas webhook reconciliation:',code);
  return res.status(code==='INVALID_EVENT'?400:503).json({received:false,error:code});
 }
}
