import { billingConfig,billingOwner,checkoutPayload,safeCheckoutLink } from '../server/billing.js';
export default async function handler(req,res) {
 res.setHeader('Cache-Control','no-store');
 if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Método não permitido.'});
 const config=billingConfig();if(!config)return res.status(503).json({error:'O Sandbox do Asaas ainda não foi configurado no servidor.'});
 const tenantId=await billingOwner(req,config.db);if(!tenantId)return res.status(403).json({error:'Acesso reservado ao administrador da clínica.'});
 if(req.method==='GET') {
  const {data,error}=await config.db.from('billing_orders').select('id,plan_id,amount,status,checkout_link,created_at').eq('tenant_id',tenantId).order('created_at',{ascending:false}).limit(10);
  return error?res.status(500).json({error:'Não foi possível consultar a cobrança.'}):res.json({environment:'sandbox',orders:data});
 }
 if(req.body?.action!=='checkout')return res.status(400).json({error:'Ação inválida.'});
 let payload;try{payload=checkoutPayload(req.body.planId,'pending',config.origin);}catch{return res.status(400).json({error:'Plano inválido.'});}
 const planId=req.body.planId;
 const order=await config.db.from('billing_orders').insert({tenant_id:tenantId,plan_id:planId,amount:payload.items[0].value}).select('id').single();
 if(order.error)return res.status(409).json({error:'Há uma cobrança em preparação ou aberta. Atualize o histórico antes de tentar novamente.'});
 payload.externalReference=order.data.id;
 try{
  const response=await fetch('https://api-sandbox.asaas.com/v3/checkouts',{method:'POST',headers:{access_token:config.key,'Content-Type':'application/json','User-Agent':'PetSanny/1.0'},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});
  if(!response.ok){await config.db.from('billing_orders').update({status:response.status>=500?'unknown':'failed'}).eq('id',order.data.id);return res.status(502).json({error:'O Asaas não confirmou a criação. Confira o histórico antes de repetir.'});}
  const result=await response.json();if(typeof result.id!=='string'||!safeCheckoutLink(result.link))throw new Error('INVALID_CHECKOUT');
  const saved=await config.db.from('billing_orders').update({checkout_id:result.id,checkout_link:result.link,status:'active'}).eq('id',order.data.id);
  if(saved.error)throw saved.error;
  return res.json({environment:'sandbox',url:result.link});
 }catch{
  await config.db.from('billing_orders').update({status:'unknown'}).eq('id',order.data.id).eq('status','creating');
  return res.status(502).json({error:'Não foi possível confirmar o checkout. Não repita até conferir a operação no Asaas.'});
 }
}
