import { billingConfig,billingOwner,checkoutPayload,safeCheckoutLink,checkoutLink } from '../server/billing.js';
export default async function handler(req,res) {
 res.setHeader('Cache-Control','no-store');
 if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Método não permitido.'});
 const config=billingConfig();if(!config)return res.status(503).json({error:'O Asaas ainda não foi configurado no servidor.'});
 const tenantId=await billingOwner(req,config.db);if(!tenantId)return res.status(403).json({error:'Acesso reservado ao administrador da clínica.'});
 if(req.method==='GET') {
  const {data,error}=await config.db.from('billing_orders').select('id,plan_id,amount,status,environment,checkout_link,created_at').eq('tenant_id',tenantId).order('created_at',{ascending:false}).limit(10);
  return error?res.status(500).json({error:'Não foi possível consultar a cobrança.'}):res.json({environment:config.environment,enabled:config.enabled,orders:data});
 }
 if(req.body?.action!=='checkout')return res.status(400).json({error:'Ação inválida.'});
 if(!config.enabled)return res.status(503).json({error:'Cobrança real aguardando validação do banco e do webhook.'});
 let payload;try{payload=checkoutPayload(req.body.planId,'pending',config.origin,new Date(),config.environment);}catch{return res.status(400).json({error:'Plano inválido.'});}
 const planId=req.body.planId;
 const reserved=config.environment==='production'?await config.db.rpc('reserve_production_checkout',{p_tenant_id:tenantId,p_plan_id:planId}):null;
 const order=reserved?{data:reserved.data?{id:reserved.data}:null,error:reserved.error}:await config.db.from('billing_orders').insert({tenant_id:tenantId,plan_id:planId,amount:payload.items[0].value,environment:config.environment}).select('id').single();
 if(order.error||!order.data?.id)return res.status(409).json({error:'Há uma cobrança ou assinatura para conferir. Atualize o histórico antes de tentar novamente.'});
 payload.externalReference=order.data.id;
 try{
  const response=await fetch(config.api+'/checkouts',{method:'POST',redirect:'error',headers:{access_token:config.key,'Content-Type':'application/json','User-Agent':'PetSanny/1.0'},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});
  if(!response.ok){await config.db.from('billing_orders').update({status:response.status>=500?'unknown':'failed'}).eq('id',order.data.id);return res.status(502).json({error:'O Asaas não confirmou a criação. Confira o histórico antes de repetir.'});}
  const result=await response.json();const link=checkoutLink(result.id,config.environment);if(!safeCheckoutLink(link,config.environment))throw new Error('INVALID_CHECKOUT');
  const saved=await config.db.from('billing_orders').update({checkout_id:result.id,checkout_link:link,status:'active'}).eq('id',order.data.id);
  if(saved.error)throw saved.error;
  return res.json({environment:config.environment,url:link});
 }catch{
  await config.db.from('billing_orders').update({status:'unknown'}).eq('id',order.data.id).eq('status','creating');
  return res.status(502).json({error:'Não foi possível confirmar o checkout. Não repita até conferir a operação no Asaas.'});
 }
}
