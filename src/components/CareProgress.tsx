import { useState } from "react";
import { TutorLinkManager } from "./TutorLinkManager";
import { useAppointments } from "../contexts/AppointmentsContext";
import { appointmentsService } from "../lib/supabaseClient";
import type { Appointment } from "../lib/supabaseClient";
const stages = {
  scheduled: "Agendado",
  received: "Pet recebido",
  in_progress: "Em atendimento",
  ready: "Pronto para buscar",
  collected: "Entregue ao tutor",
} as const;
export function CareProgress() {
  const { appointments, currentTenant, fetchAppointments } = useAppointments();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 mb-8 space-y-3">
      <h3 className="font-bold text-lg">Etapas do atendimento</h3>
      <p className="text-sm text-stone-500">
        Atualize a etapa observada pela equipe. A entrega do pet não registra
        pagamento.
      </p>
      {error && <p role="alert">{error}</p>}
      {appointments
        .filter((a) => a.status !== "canceled" && a.care_stage !== "collected")
        .map((a) => (
          <div
            key={a.id}
            className="flex flex-wrap items-center gap-3 border-b py-2"
          >
            <span className="flex-1">
              {a.pet_name} · {a.service_name} ·{" "}
              {a.appointment_date.split("-").reverse().join("/")}{" "}
              {a.appointment_time.slice(0, 5)}
            </span>
            <label>
              Etapa
              <select
                aria-label={`Etapa de ${a.pet_name}`}
                className="ml-2 border rounded-lg p-2 bg-white dark:bg-stone-950"
                value={a.care_stage ?? "scheduled"}
                disabled={busy}
                onChange={async (e) => {
                  if (busy) return;
                  setBusy(true);
                  setError("");
                  try {
                    await appointmentsService.update(
                      a.id,
                      {
                        care_stage: e.target.value as Appointment["care_stage"],
                      },
                      currentTenant.id,
                    );
                    await fetchAppointments();
                  } catch {
                    setError(
                      "Não foi possível atualizar a etapa. Tente novamente.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {Object.entries(stages).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}
      <TutorLinkManager key={currentTenant.id} />
    </section>
  );
}
