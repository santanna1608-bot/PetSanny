import { useEffect, useState } from "react";
import {
  readTutorAppointment,
  respondTutorAppointment,
} from "../lib/tutorPortal";
import type { TutorAppointment } from "../lib/tutorPortal";
const stages: Record<string, string> = {
  scheduled: "Agendado",
  received: "Pet recebido",
  in_progress: "Em atendimento",
  ready: "Pronto para buscar",
  collected: "Entregue ao tutor",
};
export function TutorPortal({ token }: { token: string }) {
  const [data, setData] = useState<TutorAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  useEffect(() => {
    let stale = false;
    setData(null);
    setLoading(true);
    void readTutorAppointment(token)
      .then((d) => {
        if (!stale) setData(d);
      })
      .catch(() => {
        if (!stale)
          setError(
            "Link inválido, revogado ou expirado. Peça um novo link à clínica.",
          );
      })
      .finally(() => {
        if (!stale) setLoading(false);
      });
    return () => {
      stale = true;
    };
  }, [token]);
  async function respond(action: "confirm" | "cancel" | "reschedule") {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await respondTutorAppointment(token, action, date, time, reason);
      setData(await readTutorAppointment(token));
      setNotice(
        action === "confirm"
          ? "Presença confirmada."
          : "Solicitação enviada. Aguarde a confirmação da clínica; o horário atual permanece até ela responder.",
      );
    } catch {
      setError(
        "Não foi possível enviar. Confira os campos ou solicite um novo link à clínica.",
      );
    } finally {
      setBusy(false);
    }
  }
  const input = "block w-full border rounded-lg p-3 mt-1";
  return (
    <main className="min-h-screen bg-stone-100 text-stone-900 p-6 flex justify-center">
      <section className="max-w-lg w-full bg-white rounded-2xl p-6 space-y-4 self-start">
        <h1 className="font-bold text-2xl">Acompanhamento do atendimento</h1>
        {loading && <p role="status">Carregando...</p>}
        {error && <p role="alert">{error}</p>}
        {data && (
          <>
            <h2 className="font-bold">
              {data.clinic_name} · {data.pet_name}
            </h2>
            <p>{data.service_name}</p>
            <p>
              {data.appointment_date.split("-").reverse().join("/")} às{" "}
              {data.appointment_time.slice(0, 5)}
            </p>
            <p>Etapa: {stages[data.care_stage] ?? data.care_stage}</p>
            <p>
              Situação:{" "}
              {
                (
                  {
                    pending: "Pendente",
                    confirmed: "Confirmado",
                    completed: "Concluído",
                    canceled: "Cancelado",
                  } as Record<string, string>
                )[data.status]
              }
            </p>
            <button
              className="border rounded-lg p-2"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  setData(await readTutorAppointment(token));
                } catch {
                  setError("Não foi possível atualizar.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Atualizar acompanhamento
            </button>
            {["pending", "confirmed"].includes(data.status) && (
              <>
                <button
                  className="block w-full bg-olive-600 text-white rounded-lg p-3"
                  disabled={busy}
                  onClick={() => void respond("confirm")}
                >
                  Confirmar presença
                </button>
                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void respond("reschedule");
                  }}
                >
                  <h3 className="font-bold">Solicitar outro horário</h3>
                  <label className="block">
                    Data desejada
                    <input
                      className={input}
                      required
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    Hora desejada
                    <input
                      className={input}
                      required
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    Observação (opcional)
                    <input
                      className={input}
                      maxLength={500}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </label>
                  <button className="border rounded-lg p-3" disabled={busy}>
                    Enviar solicitação de horário
                  </button>
                </form>
                <button
                  className="text-red-700"
                  disabled={busy}
                  onClick={() => void respond("cancel")}
                >
                  Solicitar cancelamento
                </button>
              </>
            )}
          </>
        )}
        {notice && <p role="status">{notice}</p>}
        <p className="text-xs text-stone-500">
          Este link tem prazo de validade. Compartilhe somente com quem
          acompanha este pet.
        </p>
      </section>
    </main>
  );
}
