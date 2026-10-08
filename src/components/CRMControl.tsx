import { useEffect, useState } from "react";
import { useAppointments } from "../contexts/AppointmentsContext";
import { tutorsService } from "../lib/supabaseClient";
import type { Tutor } from "../lib/supabaseClient";
import { conversationsService, messagesService } from "../lib/domainServices";
import type { ConversationRow, MessageRow } from "../lib/domainServices";
const stages = {
  lead: "Novo contato",
  first_contact: "Primeiro contato",
  first_consult: "Primeira consulta",
  active: "Ativo",
  treatment: "Em tratamento",
  return_pending: "Retorno pendente",
  inactive: "Inativo",
  vip: "VIP",
};
export function CRMControl() {
  const { currentTenant, addToast } = useAppointments();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selected, setSelected] = useState("");
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let canceled = false;
    setTutors([]);
    setSelected("");
    setMessages([]);
    setConversations([]);
    setError("");
    void Promise.all([
      tutorsService.list(currentTenant.id),
      conversationsService.list(currentTenant.id, { channel: "internal" }),
      messagesService.list(currentTenant.id),
    ])
      .then(([t, c, m]) => {
        if (!canceled) {
          setTutors(t);
          setConversations(c);
          setMessages(m);
          setSelected(t[0]?.id || "");
        }
      })
      .catch(() => {
        if (!canceled)
          setError(
            "Não foi possível carregar o CRM. Atualize a página para tentar novamente.",
          );
      });
    return () => {
      canceled = true;
    };
  }, [currentTenant.id]);
  const conversation = conversations.find((c) => c.tutor_id === selected);
  const history = messages
    .filter((m) => m.conversation_id === conversation?.id)
    .sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));
  const changeStage = async (tutor: Tutor, stage: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const saved = await tutorsService.update(
        tutor.id,
        { crm_stage: stage },
        currentTenant.id,
      );
      setTutors((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
      addToast("Etapa salva", "O cadastro do tutor foi atualizado.");
    } catch {
      addToast(
        "Erro ao salvar",
        "Não foi possível atualizar a etapa.",
        "warning",
      );
    } finally {
      setBusy(false);
    }
  };
  const saveNote = async () => {
    if (busy || !selected || !text.trim()) return;
    setBusy(true);
    try {
      let current = conversation;
      if (!current) {
        current = await conversationsService.create({
          tenant_id: currentTenant.id,
          tutor_id: selected,
          channel: "internal",
          status: "open",
        });
        setConversations((prev) => [...prev, current!]);
      }
      const saved = await messagesService.create({
        tenant_id: currentTenant.id,
        conversation_id: current.id,
        direction: "outgoing",
        body: text.trim(),
        delivery_status: "sent",
      });
      setMessages((prev) => [...prev, saved]);
      setText("");
      addToast(
        "Anotação salva",
        "Registrada no histórico interno. Nenhuma mensagem foi enviada ao tutor.",
      );
    } catch {
      addToast(
        "Erro ao salvar",
        "Não foi possível registrar a anotação.",
        "warning",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-5">
      <header>
        <h2 className="text-xl font-bold">Relacionamento com tutores</h2>
        <p className="text-sm text-stone-500">
          Etapas e histórico interno da clínica. Envio por WhatsApp e campanhas
          ainda não estão habilitados.
        </p>
      </header>
      {error && (
        <p role="alert" className="text-rose-600">
          {error}
        </p>
      )}
      {!tutors.length && !error && (
        <p>Cadastre um tutor em Clientes e Pets para começar.</p>
      )}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {tutors.map((t) => (
            <article key={t.id} className="border rounded-xl p-4 space-y-2">
              <button className="font-bold" onClick={() => setSelected(t.id)}>
                {t.name}
              </button>
              <p>{t.phone || "Telefone não cadastrado"}</p>
              <select
                aria-label={`Etapa de ${t.name}`}
                className="border rounded-lg p-2 dark:bg-stone-950"
                disabled={busy}
                value={t.crm_stage || "lead"}
                onChange={(e) => {
                  void changeStage(t, e.target.value);
                }}
              >
                {Object.entries(stages).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </article>
          ))}
        </div>
        {selected && (
          <div className="space-y-4">
            <h3 className="font-bold">
              Histórico de {tutors.find((t) => t.id === selected)?.name}
            </h3>
            {!history.length && <p>Nenhuma anotação registrada.</p>}
            {history.map((m) => (
              <article
                key={m.id}
                className="rounded-xl bg-stone-100 dark:bg-stone-950 p-4"
              >
                <p className="whitespace-pre-wrap">{m.body}</p>
                <small>
                  {m.created_at
                    ? new Date(m.created_at).toLocaleString("pt-BR")
                    : ""}
                </small>
              </article>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void saveNote();
              }}
              className="space-y-3"
            >
              <textarea
                aria-label="Anotação interna"
                required
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full border rounded-xl p-3 dark:bg-stone-950"
              />
              <button
                disabled={busy}
                className="bg-olive-600 rounded-xl px-4 py-2 text-white"
              >
                Salvar anotação interna
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
