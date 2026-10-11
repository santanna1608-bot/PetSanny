import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useAppointments } from '../contexts/AppointmentsContext';
import { requireSupabase } from '../lib/supabaseClient';
export function PetSannyAI() {
  const { currentTenant } = useAppointments();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const eligible = (currentTenant.status === 'active' && currentTenant.plan === 'Gold' && !!currentTenant.renewalDate && currentTenant.renewalDate >= today) || (currentTenant.status === 'trial' && !!currentTenant.renewalDate && currentTenant.renewalDate >= today);
  async function send(text: string) {
    if (busy || !text.trim()) return;
    setBusy(true); setReply('');
    try {
      const { data } = await requireSupabase().auth.getSession();
      if (!data.session) throw new Error('Entre novamente para usar o assistente.');
      const response = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` }, body: JSON.stringify({ tenantId: currentTenant.id, message: text }), signal: AbortSignal.timeout(25000) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Assistente indisponível.');
      setReply(result.reply); setRemaining(result.remaining);
    } catch (error) { setReply(error instanceof Error ? error.message : 'Assistente indisponível.'); }
    finally { setBusy(false); }
  }
  return (
    <aside className="fixed right-5 bottom-5 z-30">
      <button
        onClick={() => { setOpen(!open); setReply(''); setRemaining(null); }}
        aria-label="Abrir assistente"
        className="rounded-full p-4 bg-olive-600 text-white shadow-lg"
      >
        <Sparkles />
      </button>
      {open && (
        <section aria-label="Assistente PetSanny" className="absolute right-0 bottom-16 w-80 max-w-[calc(100vw-2.5rem)] max-h-[75vh] overflow-y-auto rounded-2xl border bg-white dark:bg-stone-900 p-5 shadow-xl">
          <h2 className="font-bold">Assistente PetSanny</h2>
          {!eligible ? <p className="text-sm mt-2">Disponível no Profissional: 100 consultas por mês. Consulte os planos no menu de cobrança.</p> : <>
            <p className="text-sm mt-2">Agenda, pendências e mensagens para revisar. O texto do pedido é enviado ao serviço de IA TypeSafe. Não inclua dados pessoais ou prontuários.</p>
            <p className="text-xs mt-2">{remaining === null ? currentTenant.status === 'trial' ? '10 consultas durante o teste.' : '100 consultas por mês.' : `${remaining} consultas restantes.`}</p>
            <div className="flex flex-wrap gap-2 my-3">{['Resumo da agenda de hoje', 'Pendências de hoje', 'Mensagem de retorno'].map(text => <button key={text} disabled={busy || remaining === 0} onClick={() => void send(text)} className="border rounded p-2 text-xs">{text}</button>)}</div>
            <form onSubmit={e => { e.preventDefault(); void send(message); }}>
              <label className="text-sm" htmlFor="assistant-message">Como posso ajudar?</label>
              <textarea id="assistant-message" maxLength={500} value={message} onChange={e => setMessage(e.target.value)} disabled={busy} className="w-full border rounded p-2 mt-1 bg-transparent" />
              <button disabled={busy || remaining === 0 || !message.trim()} className="rounded bg-olive-600 text-white p-2">{busy ? 'Consultando…' : 'Perguntar'}</button>
            </form>
            <p role="status" className="text-sm mt-3 whitespace-pre-wrap">{reply}</p>
          </>}
          <button className="mt-3" onClick={() => setOpen(false)}>
            Fechar
          </button>
        </section>
      )}
    </aside>
  );
}
