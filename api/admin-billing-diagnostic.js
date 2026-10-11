import { createClient } from '@supabase/supabase-js';
import { billingConfig, asaasRequest } from '../server/billing.js';
import { processAsaasEvent } from '../server/asaasEvents.js';

// Consulta manual limitada; POST reprocessa apenas checkout Sandbox já recebido como pago.
export default async function handler(req, res) {
 res.setHeader('Cache-Control', 'no-store');
 if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Método não permitido.'});
 const token=req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
 if(!token)return res.status(401).json({error:'Entre novamente.'});
 const {VITE_SUPABASE_URL:url,VITE_SUPABASE_ANON_KEY:key}=process.env;
 if(!url||!key)return res.status(503).json({error:'Configuração indisponível.'});
 const userDb=createClient(url,key,{global:{headers:{Authorization:'Bearer '+token}},auth:{persistSession:false,autoRefreshToken:false}});
 const admin=await userDb.rpc('current_platform_admin');
 if(admin.error||admin.data!==true)return res.status(403).json({error:'Acesso reservado à administração geral.'});
 const config=billingConfig();
 if(!config||config.environment!=='sandbox')return res.status(409).json({error:'Este diagnóstico está disponível somente no Sandbox.'});
 if(req.method==='POST'&&req.body?.action!=='reconcile')return res.status(400).json({error:'Ação inválida.'});
 const orderId=req.method==='POST'?req.body?.orderId:req.query?.orderId;
 if(typeof orderId!=='string'||!/^\w{8}(-\w{4}){3}-\w{12}$/.test(orderId))return res.status(400).json({error:'Pedido inválido.'});
 const found=await config.db.from('billing_orders').select('id,checkout_id,amount,created_at,status').eq('id',orderId).eq('environment','sandbox').maybeSingle();
 if(found.error)return res.status(503).json({error:'Não foi possível consultar o pedido.'});
 if(!found.data?.checkout_id)return res.status(404).json({error:'Checkout de teste não encontrado.'});
 const order=found.data;
 if(req.method==='POST') {
  if(!config.reconcileSandbox||order.status!=='paid')return res.status(409).json({error:'Somente um checkout de teste já recebido como pago pode ser reprocessado.'});
  try {
   await processAsaasEvent(config,{id:'manual:'+order.id+':'+Date.now(),event:'CHECKOUT_PAID',checkout:{id:order.checkout_id}});
   return res.json({environment:'sandbox',reconciled:true});
  }catch{return res.status(502).json({error:'Não foi possível concluir a conciliação. Atualize o diagnóstico antes de tentar novamente.'});}
 }
 if(!/^\d{4}-\d{2}-\d{2}/.test(order.created_at))return res.status(503).json({error:'Data do pedido inválida.'});
 try {
  const paths=[
   '/payments?checkoutSession='+encodeURIComponent(order.checkout_id)+'&limit=100',
   '/lean/payments?checkoutSession='+encodeURIComponent(order.checkout_id)+'&limit=100',
   '/payments?externalReference='+encodeURIComponent(order.id)+'&limit=100',
   '/payments?dateCreated%5Bge%5D='+order.created_at.slice(0,10)+'&limit=100'
  ];
  const results=await Promise.all(paths.map(path=>asaasRequest(config,path)));
  if(results.some(r=>!Array.isArray(r.data)))throw Error('INVALID_RESPONSE');
  const summary=r=>({count:r.data.length,complete:r.hasMore===false,
   exactCheckout:r.data.filter(p=>p.checkoutSession===order.checkout_id).length,
   exactReference:r.data.filter(p=>p.externalReference===order.id).length,
   subscriptionPresent:r.data.filter(p=>typeof p.subscription==='string'&&p.subscription.length>0).length});
  return res.json({environment:'sandbox',checkout:summary(results[0]),lean:summary(results[1]),reference:summary(results[2]),recent:summary(results[3])});
 }catch{return res.status(502).json({error:'O Asaas não confirmou a consulta. Nenhuma alteração foi feita.'});}
}
