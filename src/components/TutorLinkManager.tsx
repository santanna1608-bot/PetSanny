import { useEffect, useState } from "react";
import { useAppointments } from "../contexts/AppointmentsContext";
import { requireSupabase } from "../lib/supabaseClient";
import {
  appointmentRequestsService,
  issueTutorLink,
  revokeTutorLinks,
} from "../lib/tutorPortal";
import type { AppointmentRequest } from "../lib/tutorPortal";
export function TutorLinkManager() {
  const { appointments, currentTenant, fetchAppointments } = useAppointments();
  const [selected, setSelected] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  useEffect(() => {
    let stale = false;
    void appointmentRequestsService
      .list(currentTenant.id)
      .then((rows) => {
        if (!stale) setRequests(rows);
      })
      .catch(() => {
        if (!stale)
          setError("Não foi possível carregar as solicitações do tutor.");
      });
    return () => {
      stale = true;
    };
  }, [currentTenant.id]);
  async function handle(id: string, accept: boolean) {
    setBusy(true);
    setError("");
    try {
      const { error } = await requireSupabase().rpc(
        "handle_appointment_request",
        { p_id: id, p_accept: accept },
      );
      if (error) throw error;
      setRequests(await appointmentRequestsService.list(currentTenant.id));
      await fetchAppointments();
    } catch {
      setError(
        "Não foi possível concluir a solicitação. Confira se o horário está disponível.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="border rounded-xl p-4 space-y-3">
      <summary className="font-bold cursor-pointer">
        Link privado e solicitações do tutor
      </summary>
      <p className="text-sm text-stone-500">
        O link dura 48 horas e mostra apenas este atendimento. Gere e
        compartilhe individualmente com o tutor. Gerar outro link invalida o
        anterior.
      </p>
      {error && <p role="alert">{error}</p>}
      <label className="block">
        Atendimento
        <select
          className="block border rounded-lg p-2 w-full bg-white dark:bg-stone-950"
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            setLink("");
          }}
        >
          <option value="">Selecione</option>
          {appointments
            .filter((a) => a.status !== "canceled")
            .map((a) => (
              <option key={a.id} value={a.id}>
                {a.pet_name} · {a.appointment_date}{" "}
                {a.appointment_time.slice(0, 5)}
              </option>
            ))}
        </select>
      </label>
      <button
        className="border rounded-lg p-2 mr-3"
        disabled={!selected || busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          setLink("");
          try {
            setLink(await issueTutorLink(selected, window.location.origin));
          } catch {
            setError("Não foi possível gerar o link.");
          } finally {
            setBusy(false);
          }
        }}
      >
        Gerar link de 48 horas
      </button>
      <button
        className="border rounded-lg p-2"
        disabled={!selected || busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await revokeTutorLinks(selected);
            setLink("");
          } catch {
            setError("Não foi possível revogar.");
          } finally {
            setBusy(false);
          }
        }}
      >
        Revogar links deste atendimento
      </button>
      {link && (
        <label className="block">
          Copie e envie somente ao tutor
          <input
            className="block border rounded-lg p-2 w-full"
            readOnly
            value={link}
          />
        </label>
      )}
      <h4 className="font-semibold">Solicitações pendentes</h4>
      {requests
        .filter((r) => r.status === "pending")
        .map((r) => (
          <div className="border-b py-3 space-y-2" key={r.id}>
            <p>
              {appointments.find((a) => a.id === r.appointment_id)?.pet_name ??
                "Pet"}{" "}
              ·{" "}
              {r.action === "cancel"
                ? "Cancelamento solicitado"
                : `Reagendamento para ${r.desired_date} ${r.desired_time?.slice(0, 5)}`}
            </p>
            {r.reason && <p>{r.reason}</p>}
            <button
              className="bg-olive-600 text-white rounded-lg p-2 mr-3"
              disabled={busy}
              onClick={() => void handle(r.id, true)}
            >
              Aceitar e atualizar agenda
            </button>
            <button disabled={busy} onClick={() => void handle(r.id, false)}>
              Recusar solicitação
            </button>
          </div>
        ))}
    </details>
  );
}
