import { createClient } from '@supabase/supabase-js';
import { createHash, timingSafeEqual } from 'node:crypto';
import plans from '../shared/plans.json' with { type: 'json' };
export function validWebhookToken(received, expected) {
 if(typeof received!=='string'||!expected||expected.length<32)return false;
 return timingSafeEqual(createHash('sha256').update(received).digest(),createHash('sha256').update(expected).digest());
}
export function checkoutPayload(planId,orderId,origin,now=new Date(),environment='sandbox') {
 const plan=plans.find(p=>p.id===planId);if(!plan)throw new Error('INVALID_PLAN');
 const base=new URL(origin);if(base.protocol!=='https:')throw new Error('INVALID_ORIGIN');
 return {billingTypes:['CREDIT_CARD'],chargeTypes:['RECURRENT'],minutesToExpire:60,externalReference:orderId,
  callback:{successUrl:base.origin+'/?billing=return#dashboard',cancelUrl:base.origin+'/?billing=cancel#dashboard',expiredUrl:base.origin+'/?billing=expired#dashboard'},
  items:[{name:'PetSanny — '+plan.name,description:environment==='production'?'Assinatura mensal PetSanny':'Assinatura mensal de teste Sandbox',quantity:1,value:plan.price}],
  subscription:{cycle:'MONTHLY',nextDueDate:new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now)}};
}
export function safeCheckoutLink(link,environment='sandbox') {
 try{const url=new URL(link);const hosts=environment==='production'?['asaas.com','www.asaas.com']:['sandbox.asaas.com'];return url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&hosts.includes(url.hostname)&&(url.pathname==='/checkoutSession/show'&&Boolean(url.searchParams.get('id'))||url.pathname.startsWith('/checkoutSession/show/'));}catch{return false;}
}
export function checkoutLink(id,environment='sandbox') {
 if(typeof id!=='string'||!/^[a-zA-Z0-9_-]{1,200}$/.test(id))throw Error('INVALID_CHECKOUT');
 return `https://${environment==='production'?'asaas.com':'sandbox.asaas.com'}/checkoutSession/show?id=${encodeURIComponent(id)}`;
}
export function billingConfig(env=process.env) {
 const environment=env.ASAAS_ENVIRONMENT|| (env.ASAAS_PRODUCTION_API_KEY?'production':'sandbox');
 if(!['sandbox','production'].includes(environment))return null;
 const key=environment==='production'?env.ASAAS_PRODUCTION_API_KEY:env.ASAAS_API_KEY;
 if(!env.SUPABASE_SERVICE_ROLE_KEY||!env.VITE_SUPABASE_URL||!key||!env.ASAAS_WEBHOOK_TOKEN||env.ASAAS_WEBHOOK_TOKEN.length<32)return null;
 return {key,environment,enabled:environment==='sandbox'||env.ASAAS_PRODUCTION_ENABLED==='true',api:environment==='production'?'https://api.asaas.com/v3':'https://api-sandbox.asaas.com/v3',webhookToken:env.ASAAS_WEBHOOK_TOKEN,origin:env.APP_ORIGIN||'https://petsanny.vercel.app',
  db:createClient(env.VITE_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}})};
}
export async function asaasRequest(config,path,options={}) {
 if(!path.startsWith('/')||path.startsWith('//'))throw Error('INVALID_PATH');
 const response=await fetch(config.api+path,{...options,redirect:'error',headers:{access_token:config.key,'Content-Type':'application/json','User-Agent':'PetSanny/1.0'},signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error(response.status>=500?'ASAAS_UNCERTAIN':'ASAAS_REJECTED');
 return response.json();
}
export async function billingOwner(req,db) {
 const token=req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];if(!token)return null;
 const {data,error}=await db.auth.getUser(token);if(error||!data.user)return null;
 const tenantId=req.method==='GET'?req.query.tenantId:req.body?.tenantId;
 if(typeof tenantId!=='string'||!/^\w{8}(-\w{4}){3}-\w{12}$/.test(tenantId))return null;
 const membership=await db.from('tenant_memberships').select('tenant_id').eq('tenant_id',tenantId).eq('user_id',data.user.id).eq('active',true).in('role',['owner','admin']).maybeSingle();
 return membership.error||!membership.data?null:tenantId;
}
