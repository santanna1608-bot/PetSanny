import { useState } from "react";
import { useAppointments } from '../contexts/AppointmentsContext';
import { requireSupabase } from '../lib/supabaseClient';
function AssistantAvatar() {
  return <svg viewBox="0 0 48 48" aria-hidden="true" className="h-10 w-10">
    <path d="M8 46c0-10 6-15 16-15s16 5 16 15" fill="#faf8f2" />
    <path d="M19 29h10v7c-3 3-7 3-10 0z" fill="#ddb18e" />
    <ellipse cx="24" cy="20" rx="11" ry="13" fill="#f2cfad" />
    <path d="M13 20C9 8 15 3 24 3s15 7 11 17l-2-7c-6 1-10-1-13-4-1 4-3 7-7 8z" fill="#343b2c" />
    <path d="M10 21v-4a14 14 0 0 1 28 0v9" fill="none" stroke="#faf8f2" strokeWidth="3" strokeLinecap="round" />
    <rect x="8" y="18" width="6" height="10" rx="3" fill="#faf8f2" />
    <rect x="34" y="18" width="6" height="10" rx="3" fill="#faf8f2" />
    <path d="M37 27c0 5-5 6-9 6" fill="none" stroke="#faf8f2" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="25" y="31" width="6" height="4" rx="2" fill="#343b2c" />
    <circle cx="20" cy="21" r="1.2" fill="#343b2c" /><circle cx="28" cy="21" r="1.2" fill="#343b2c" />
    <path d="M21 26q3 3 6 0" fill="none" stroke="#845a42" strokeWidth="1.5" strokeLinecap="round" />
  </svg>;
}
export function PetSannyAI() {
  const { currentTenant } = useAppointments();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const eligible = (currentTenant.status === 'active' && currentTenant.plan === 'Gold' && !!currentTenant.renewalDate && currentTenant.renewalDate >= today) || (currentTenant.status === 'trial' && !!currentTenant.renewalDate && currentTenant.renewalDate >= today);
  async function send(text: string) {
    if (busy || !text.trim()) return;
    setBusy(true); setReply('');
    try {
      const { data } = await requireSupabase().auth.getSession();
      if (!data.session) throw new Error('Entre novamente para usar o assistente.');
      const response = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` }, body: JSON.stringify({ tenantId: currentTenant.id, message: text, history: history.slice(-4) }), signal: AbortSignal.timeout(45000) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Assistente indisponível.');
      setReply(result.reply); setRemaining(result.remaining);
      setHistory(previous => [...previous.slice(-4), { role: 'user', content: text }, { role: 'assistant', content: result.reply.slice(0, 2000) }]); setMessage('');
    } catch (error) { setReply(error instanceof Error ? error.message : 'Assistente indisponível.'); }
    finally { setBusy(false); }
  }
  return (
    <aside className="fixed right-5 bottom-5 z-30">
      <button
        onClick={() => { setOpen(!open); setReply(''); setRemaining(null); setHistory([]); setMessage(''); }}
        aria-label="Abrir assistente com IA"
        aria-expanded={open}
        aria-controls="petsanny-assistant"
        title="Assistente com IA"
        className="rounded-full p-2 bg-olive-600 text-white shadow-lg ring-2 ring-white/80 hover:bg-olive-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-olive-600"
      >
        <AssistantAvatar />
      </button>
      {open && (
        <section id="petsanny-assistant" aria-label="Assistente com IA" className="absolute right-0 bottom-16 w-80 max-w-[calc(100vw-2.5rem)] max-h-[75vh] overflow-y-auto rounded-2xl border bg-white dark:bg-stone-900 p-5 shadow-xl">
          <h2 className="font-bold">Assistente com IA</h2>
          {!eligible ? <p className="text-sm mt-2">Disponível no Profissional: 100 consultas por mês. Consulte os planos no menu de cobrança.</p> : <>
            <p className="text-sm mt-2">Agenda, pendências e mensagens para revisar. A conversa é processada por OpenAI e TypeSafe; indicadores gerais da sua clínica são enviados à OpenAI. Não inclua dados pessoais ou prontuários.</p>
            <p className="text-xs mt-2">{remaining === null ? currentTenant.status === 'trial' ? '10 consultas durante o teste.' : '100 consultas por mês.' : `${remaining} consultas restantes.`}</p>
            <div className="flex flex-wrap gap-2 my-3">{['Resumo da agenda de hoje', 'Pendências de hoje', 'Mensagem de retorno'].map(text => <button key={text} disabled={busy || remaining === 0} onClick={() => void send(text)} className="border rounded p-2 text-xs">{text}</button>)}</div>
            <form onSubmit={e => { e.preventDefault(); void send(message); }}>
              <label className="text-sm" htmlFor="assistant-message">Como posso ajudar?</label>
              <textarea id="assistant-message" maxLength={500} value={message} onChange={e => setMessage(e.target.value)} disabled={busy} className="w-full border rounded p-2 mt-1 bg-transparent" />
              <button disabled={busy || remaining === 0 || !message.trim()} className="rounded bg-olive-600 text-white p-2">{busy ? 'Consultando…' : 'Perguntar'}</button>
            </form>
            <div aria-label="Conversa" className="space-y-3 mt-3">{history.map((entry, i) => <p key={i} className="text-sm whitespace-pre-wrap"><strong>{entry.role === 'user' ? 'Você: ' : 'PetSanny: '}</strong>{entry.content}</p>)}</div>
            <p role="status" className="text-sm mt-3 whitespace-pre-wrap">{busy ? 'Consultando…' : history.at(-1)?.content !== reply ? reply : ''}</p>
          </>}
          <button className="mt-3" onClick={() => setOpen(false)}>
            Fechar
          </button>
        </section>
      )}
    </aside>
  );
}
