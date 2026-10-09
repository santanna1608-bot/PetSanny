import { billingConfig,validWebhookToken } from '../server/billing.js';
export default async function handler(req,res) {
 res.setHeader('Cache-Control','no-store');if(req.method!=='POST')return res.status(405).end();
 const config=billingConfig();if(!config)return res.status(503).end();
 if(!validWebhookToken(req.headers['asaas-access-token'],config.webhookToken))return res.status(401).end();
 const {id,event,checkout}=req.body||{};
 if(typeof id!=='string'||id.length>200||typeof event!=='string')return res.status(400).end();
 if(!['CHECKOUT_PAID','CHECKOUT_CANCELED','CHECKOUT_EXPIRED'].includes(event))return res.json({received:true,ignored:true});
 if(typeof checkout?.id!=='string')return res.status(400).end();
 const result=await config.db.rpc('process_sandbox_checkout_event',{p_event_id:id,p_checkout_id:checkout.id,p_event:event});
 return result.error?res.status(503).end():res.json({received:true});
}
