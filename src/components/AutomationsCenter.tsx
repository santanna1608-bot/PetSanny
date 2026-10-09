import { useEffect, useState } from "react";
import { useAppointments } from "../contexts/AppointmentsContext";
import { automationService } from "../lib/domainServices";
import type { AutomationRow } from "../lib/domainServices";
import { MessagePreviews } from './MessagePreviews';
export function AutomationsCenter() {
  const { currentTenant, addToast } = useAppointments();
  const [rules, setRules] = useState<AutomationRow[]>([]);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("");
  const [action, setAction] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let canceled = false;
    setRules([]);
    setError("");
    void automationService
      .list(currentTenant.id)
      .then((r) => {
        if (!canceled) setRules(r);
      })
      .catch(() => {
        if (!canceled) setError("Não foi possível carregar as regras.");
      });
    return () => {
      canceled = true;
    };
  }, [currentTenant.id]);
  return (
    <section className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-5">
      <h2 className="text-xl font-bold">Central de automações</h2>
      <MessagePreviews key={currentTenant.id}/>
      <p className="rounded-xl bg-amber-50 text-amber-900 p-4">
        Você pode salvar rascunhos de regras. A execução automática, a conexão
        WhatsApp e o envio de mensagens estão em preparação.
      </p>
      {error && <p role="alert">{error}</p>}
      <form
        className="space-y-3 max-w-lg"
        onSubmit={(e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          void automationService
            .create({
              tenant_id: currentTenant.id,
              name: name.trim(),
              description: "Rascunho",
              trigger: trigger.trim(),
              actions: [action.trim()],
              active: false,
            })
            .then((row) => {
              setRules((prev) => [...prev, row]);
              setName("");
              setTrigger("");
              setAction("");
              addToast(
                "Rascunho salvo",
                "A regra foi salva e permanece desativada.",
              );
            })
            .catch(() =>
              addToast(
                "Erro ao salvar",
                "Não foi possível salvar a regra. Acesso restrito a administradores da clínica.",
                "warning",
              ),
            )
            .finally(() => setBusy(false));
        }}
      >
        <label className="block">
          Nome
          <input
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full block border rounded-xl p-3 dark:bg-stone-950"
          />
        </label>
        <label className="block">
          Quando acontecer
          <input
            required
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            className="w-full block border rounded-xl p-3 dark:bg-stone-950"
          />
        </label>
        <label className="block">
          Ação desejada
          <input
            required
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full block border rounded-xl p-3 dark:bg-stone-950"
          />
        </label>
        <button
          disabled={busy}
          className="bg-olive-600 rounded-xl text-white px-4 py-2"
        >
          Salvar rascunho
        </button>
      </form>
      {!rules.length && <p>Nenhuma regra cadastrada.</p>}
      {rules.map((r) => (
        <article className="border rounded-xl p-4" key={r.id}>
          <h3 className="font-bold">{r.name} · Desativada</h3>
          <p>{r.trigger}</p>
          <p>{r.actions.join(", ")}</p>
        </article>
      ))}
    </section>
  );
}
