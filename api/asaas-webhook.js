import { billingConfig,validWebhookToken } from '../server/billing.js';
import { processAsaasEvent,checkoutEvents,paymentEvents } from '../server/asaasEvents.js';
export default async function handler(req,res) {
 res.setHeader('Cache-Control','no-store');if(req.method!=='POST')return res.status(405).end();
 const config=billingConfig();if(!config)return res.status(503).end();
 if(!validWebhookToken(req.headers['asaas-access-token'],config.webhookToken))return res.status(401).end();
 const {id,event}=req.body||{};
 if(typeof id!=='string'||!id||id.length>200||typeof event!=='string')return res.status(400).end();
 if(config.environment==='sandbox'){
  if(!checkoutEvents.includes(event))return res.json({received:true,ignored:true});
  if(typeof req.body.checkout?.id!=='string')return res.status(400).end();
  const saved=await config.db.rpc('process_sandbox_checkout_event',{p_event_id:id,p_checkout_id:req.body.checkout.id,p_event:event});
  return saved.error?res.status(503).end():res.json({received:true});
 }
 if(![...checkoutEvents,...paymentEvents].includes(event))return res.json({received:true,ignored:true});
 try{await processAsaasEvent(config,req.body);return res.json({received:true});}catch(e){return res.status(e.message==='INVALID_EVENT'?400:503).end();}
}
