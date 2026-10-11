import {createClient} from '@supabase/supabase-js';
import {classifyRequest,assistantText,naturalReply,validHistory} from '../server/assistant.js';
export default async function handler(req,res) {
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Método não permitido.'});
 const {tenantId,message,history=[]}=req.body||{};const token=req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
 if(!token)return res.status(401).json({error:'Entre novamente para usar o assistente.'});
 if(typeof tenantId!=='string'||!/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(tenantId)||typeof message!=='string'||!message.trim()||message.length>500)return res.status(400).json({error:'Informe um pedido de até 500 caracteres.'});
 if(!validHistory(history))return res.status(400).json({error:'Conversa muito longa. Feche e abra o assistente para começar novamente.'});
 const env=process.env;
 if(!env.TYPESAFE_API_KEY||!env.OPENAI_API_KEY||!env.VITE_SUPABASE_URL||!env.SUPABASE_SERVICE_ROLE_KEY)return res.status(503).json({error:'O assistente aguarda configuração no servidor.'});
 const db=createClient(env.VITE_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:auth,error:authError}=await db.auth.getUser(token);
 if(authError||!auth.user)return res.status(401).json({error:'Sessão inválida.'});
 const {data:quota,error:quotaError}=await db.rpc('reserve_assistant_use',{p_tenant:tenantId,p_user:auth.user.id});
 if(quotaError)return res.status(503).json({error:'Não foi possível verificar o acesso ao assistente.'});
 if(!quota?.allowed)return res.status(quota?.reason==='quota'?429:403).json({error:quota?.reason==='quota'?'A cota do assistente foi utilizada.':'Disponível no Profissional ou durante um teste gratuito válido.'});
 try {
  const route=await classifyRequest(message.trim(),env.TYPESAFE_API_KEY,fetch,history);
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  let facts={};
  if(route==='agenda'||route==='pendencias') {
   const {data,error}=await db.from('appointments').select('status').eq('tenant_id',tenantId).eq('appointment_date',today).limit(5001);
   if(error||!data||data.length>5000)throw Error('DATA_UNAVAILABLE');
   facts={total:data.length,pending:data.filter(a=>a.status==='pending').length,confirmed:data.filter(a=>a.status==='confirmed').length,completed:data.filter(a=>a.status==='completed').length,canceled:data.filter(a=>a.status==='canceled').length};
   if(route==='pendencias') {
    const {count,error:reminderError}=await db.from('pet_reminders').select('id',{count:'exact',head:true}).eq('tenant_id',tenantId).eq('done',false).lte('reminder_date',today);
    if(reminderError)throw Error('DATA_UNAVAILABLE');facts.reminders=count;
   }
  }
  const reply=route==='fora'?assistantText(route):await naturalReply(message.trim(),route,facts,history,env.OPENAI_API_KEY,env.OPENAI_ASSISTANT_MODEL||'gpt-4.1-mini');
  return res.json({reply,remaining:quota.remaining,limit:quota.limit});
 } catch {return res.status(503).json({error:'Não foi possível responder agora. Tente mais tarde. Esta tentativa contou na cota.'});}
}
