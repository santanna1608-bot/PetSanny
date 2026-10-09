import { useEffect, useState } from 'react';
import { Cable, MessageCircle, Mail, CalendarDays, CreditCard, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAppointments } from '../contexts/AppointmentsContext';
import { requireSupabase } from '../lib/supabaseClient';

type Connection = { id: string; provider: string; display_name: string; status: string; last_verified_at: string | null };
const providers = { meta: 'Meta Cloud API', gupshup: 'Gupshup', twilio: 'Twilio', '360dialog': '360dialog' };
const states: Record<string,string> = { not_configured: 'Configuração pendente', connected: 'Conectado', disconnected: 'Desconectado', error: 'Precisa de atenção' };
export function ConnectionsCenter() {
 const supabase = requireSupabase();
 const { currentTenant } = useAppointments();
 const [connection,setConnection] = useState<Connection | null>(null);
 const [provider,setProvider] = useState('meta');
 const [name,setName] = useState('WhatsApp da clínica');
 const [loading,setLoading] = useState(true);
 const [busy,setBusy] = useState(false);
 const [error,setError] = useState('');
 const [notice,setNotice] = useState('');
 async function load() {
  const {data,error: failure} = await supabase.from('integration_connections').select('id,provider,display_name,status,last_verified_at').eq('tenant_id',currentTenant.id).eq('channel','whatsapp').maybeSingle();
  if(failure) throw failure;
  setConnection(data); if(data){setProvider(data.provider);setName(data.display_name);}
 }
 useEffect(()=> { let stale=false; setLoading(true); setError('');
  void supabase.from('integration_connections').select('id,provider,display_name,status,last_verified_at').eq('tenant_id',currentTenant.id).eq('channel','whatsapp').maybeSingle().then(({data,error:failure})=>{
   if(stale)return; if(failure)setError('Não foi possível carregar as conexões. Este ambiente é reservado aos administradores da clínica.');
   else {setConnection(data);if(data){setProvider(data.provider);setName(data.display_name);}} setLoading(false);
  }); return ()=>{stale=true;};
 },[currentTenant.id,supabase]);
 const card='rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6';
 return <div className="space-y-6">
  <header><div className="flex items-center gap-3"><Cable className="text-olive-600"/><h2 className="text-2xl font-bold">Central de conexões</h2></div><p className="text-stone-500 mt-2">Gerencie os serviços que se conectam à {currentTenant.name}.</p></header>
  {error&&<p role="alert" className="rounded-xl bg-red-50 text-red-800 p-4">{error}</p>}
  {notice&&<p role="status" className="rounded-xl bg-emerald-50 text-emerald-800 p-4">{notice}</p>}
  <section className={card}>
   <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="flex items-center gap-2 text-lg font-bold"><MessageCircle className="text-olive-600"/>WhatsApp</h3><span className="rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1 text-sm">{loading?'Carregando…':connection?states[connection.status]:'Não configurado'}</span></div>
   <p className="text-sm text-stone-500 mt-3">Prepare a conexão oficial para confirmações, lembretes e avisos de atendimento. Cada clínica utilizará seu próprio número.</p>
   <form className="grid sm:grid-cols-2 gap-4 mt-5" onSubmit={async e=>{e.preventDefault();if(busy||loading||error)return;setBusy(true);setNotice('');try{
    const payload={provider,display_name:name.trim()};
    const result=connection?await supabase.from('integration_connections').update(payload).eq('id',connection.id).eq('tenant_id',currentTenant.id).select('id').single():await supabase.from('integration_connections').insert({...payload,tenant_id:currentTenant.id,channel:'whatsapp'}).select('id').single();
    if(result.error)throw result.error;await load();setNotice('Preferências salvas. O WhatsApp ainda não foi conectado e nenhum envio foi ativado.');
   }catch{setError('Não foi possível salvar. Verifique seu acesso de administrador ou atualize as conexões.');}finally{setBusy(false);}}}>
    <label>Nome da conexão<input required minLength={2} maxLength={80} value={name} onChange={e=>setName(e.target.value)} className="block mt-1 w-full border rounded-xl p-3 dark:bg-stone-950"/></label>
    <label>Provedor<select value={provider} onChange={e=>setProvider(e.target.value)} className="block mt-1 w-full border rounded-xl p-3 dark:bg-stone-950">{Object.entries(providers).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
    <div className="sm:col-span-2 flex flex-wrap gap-3"><button disabled={busy||loading||!!error||!!connection&&connection.status!=='not_configured'} className="bg-olive-600 text-white rounded-xl px-5 py-3 disabled:opacity-50">{busy?'Salvando…':'Salvar preparação'}</button><button type="button" disabled={busy||loading} className="border rounded-xl px-4 py-3 flex items-center gap-2" onClick={async()=>{setBusy(true);setError('');try{await load();}catch{setError('Não foi possível atualizar as conexões.');}finally{setBusy(false);}}}><RefreshCw size={16}/>Atualizar status</button></div>
   </form>
   <div className="mt-5 rounded-xl bg-amber-50 text-amber-900 p-4 text-sm"><strong>Para conectar</strong><p className="mt-1">Será necessário configurar a conta empresarial, verificar o número e autorizar o provedor. A conexão e os envios serão habilitados após essa configuração e um teste real.</p></div>
   {connection?.last_verified_at&&<p className="mt-3 text-xs text-stone-500">Última verificação: {new Date(connection.last_verified_at).toLocaleString('pt-BR')}</p>}
  </section>
  <section><h3 className="font-bold mb-3">Próximas integrações</h3><div className="grid sm:grid-cols-3 gap-4">{[{title:'E-mail',Icon:Mail,text:'Lembretes e comunicação com tutores.'},{title:'Calendários',Icon:CalendarDays,text:'Sincronização da agenda da equipe.'},{title:'Pagamentos',Icon:CreditCard,text:'Cobranças e acompanhamento de pagamentos.'}].map(({title,Icon,text})=><article key={title} className={card}><Icon className="text-stone-400 mb-3"/><h4 className="font-bold">{title}</h4><p className="text-sm text-stone-500 mt-2">{text}</p><span className="block text-xs mt-4 text-stone-500">Planejado · Ainda indisponível</span></article>)}</div></section>
  <p className="flex gap-2 text-sm text-stone-500"><ShieldCheck className="shrink-0" size={18}/>Credenciais serão configuradas no servidor. Esta tela não solicita nem armazena tokens ou senhas.</p>
 </div>;
}
