import { useEffect, useState } from "react";
import { useAppointments } from "../contexts/AppointmentsContext";
import { petsService } from "../lib/supabaseClient";
import type { Pet, Appointment } from "../lib/supabaseClient";
import {
  waitlistService,
  appointmentEventsService,
  matchingWaitlist,
  cancelAppointment,
  rescheduleAppointment,
  bookWaitlistEntry,
} from "../lib/scheduling";
import type { WaitlistEntry, AppointmentEvent } from "../lib/scheduling";
import { localDate } from "../lib/dates";

export function ScheduleRecovery() {
  const { currentTenant, appointments, fetchAppointments, addToast } =
    useAppointments();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [events, setEvents] = useState<AppointmentEvent[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [canceling, setCanceling] = useState<Appointment | null>(null);
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [petId, setPetId] = useState("");
  const [service, setService] = useState("");
  const [type, setType] = useState<"vet" | "aesthetic">("aesthetic");
  const [professional, setProfessional] = useState("");
  const [start, setStart] = useState(localDate());
  const [end, setEnd] = useState(localDate());
  const [from, setFrom] = useState("08:00");
  const [until, setUntil] = useState("18:00");
  const [price, setPrice] = useState("0");
  useEffect(() => {
    let stale = false;
    setEntries([]);
    setPets([]);
    setPetId("");
    setEditing(null);
    setCanceling(null);
    setError("");
    setLoading(true);
    setEvents([]);
    void Promise.all([
      waitlistService.list(currentTenant.id),
      petsService.list(currentTenant.id),
      appointmentEventsService.list(currentTenant.id),
    ])
      .then(([w, p, h]) => {
        if (!stale) {
          setEntries(w);
          setPets(p);
          setEvents(h);
        }
      })
      .catch(() => {
        if (!stale)
          setError(
            "Não foi possível carregar a fila. Confira se a atualização da agenda foi instalada.",
          );
      })
      .finally(() => {
        if (!stale) setLoading(false);
      });
    return () => {
      stale = true;
    };
  }, [currentTenant.id]);
  async function run(action: () => Promise<unknown>) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await action();
      setEntries(await waitlistService.list(currentTenant.id));
      setEvents(await appointmentEventsService.list(currentTenant.id));
      await fetchAppointments();
      addToast("Agenda atualizada", "Alteração salva.");
      setEditing(null);
      setCanceling(null);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível salvar. Confira o horário e tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  const input =
    "border border-stone-300 dark:border-stone-700 rounded-lg p-2 bg-white dark:bg-stone-950 w-full";
  const button =
    "rounded-lg px-3 py-2 bg-olive-600 text-white disabled:opacity-50";
  return (
    <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 mb-8 space-y-5">
      <h3 className="font-bold text-lg">Recuperação de agenda</h3>
      <p className="text-sm text-stone-500">
        Cancele mantendo o histórico, reagende e preencha vagas com a lista de
        espera. Confirme a disponibilidade com o tutor antes de reservar.
      </p>
      {loading && <p role="status">Carregando fila...</p>}
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      <div className="space-y-2">
        {appointments
          .filter((a) => a.status === "pending" || a.status === "confirmed")
          .map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap gap-3 items-center border-b py-2"
            >
              <span className="flex-1">
                {a.pet_name} ·{" "}
                {a.appointment_date.split("-").reverse().join("/")}{" "}
                {a.appointment_time.slice(0, 5)}
              </span>
              <button
                disabled={busy || loading}
                className={button}
                onClick={() => {
                  setEditing(a);
                  setCanceling(null);
                  setDate(a.appointment_date);
                  setTime(a.appointment_time.slice(0, 5));
                  setDuration(a.duration_minutes ?? 60);
                }}
              >
                Reagendar
              </button>
              <button
                disabled={busy || loading}
                className="text-red-700"
                onClick={() => {
                  setCanceling(a);
                  setEditing(null);
                  setReason("");
                }}
              >
                Cancelar atendimento
              </button>
            </div>
          ))}
      </div>
      {editing && (
        <form
          className="space-y-3 border rounded-xl p-4"
          onSubmit={(e) => {
            e.preventDefault();
            void run(() =>
              rescheduleAppointment(editing.id, date, time, duration),
            );
          }}
        >
          <h4>Reagendar {editing.pet_name}</h4>
          <label className="block">
            Data
            <input
              className={input}
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="block">
            Hora
            <input
              className={input}
              required
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
          <label className="block">
            Duração em minutos
            <input
              className={input}
              required
              type="number"
              min={5}
              max={480}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </label>
          <button className={button} disabled={busy}>
            Salvar reagendamento
          </button>
          <button
            type="button"
            className="ml-3"
            disabled={busy}
            onClick={() => setEditing(null)}
          >
            Voltar
          </button>
        </form>
      )}
      {canceling && (
        <form
          className="space-y-3 border rounded-xl p-4"
          onSubmit={(e) => {
            e.preventDefault();
            void run(() => cancelAppointment(canceling.id, reason));
          }}
        >
          <h4>Cancelar atendimento de {canceling.pet_name}</h4>
          <label className="block">
            Motivo
            <input
              className={input}
              required
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <button className={button} disabled={busy}>
            Confirmar cancelamento
          </button>
          <button
            type="button"
            className="ml-3"
            disabled={busy}
            onClick={() => setCanceling(null)}
          >
            Voltar
          </button>
        </form>
      )}
      <details>
        <summary className="font-semibold cursor-pointer">
          Adicionar pet à lista de espera
        </summary>
        <form
          className="grid sm:grid-cols-2 gap-3 mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            const pet = pets.find((p) => p.id === petId);
            if (!pet) return;
            void run(() =>
              waitlistService.create({
                tenant_id: currentTenant.id,
                tutor_id: pet.tutor_id,
                pet_id: pet.id,
                service_name: service.trim(),
                service_type: type,
                professional_name: professional.trim() || null,
                earliest_date: start,
                latest_date: end,
                earliest_time: from,
                latest_time: until,
                duration_minutes: duration,
                price: Number(price),
                status: "waiting",
                appointment_id: null,
              }),
            );
          }}
        >
          <label>
            Pet
            <select
              className={input}
              value={petId}
              required
              onChange={(e) => setPetId(e.target.value)}
            >
              <option value="">Selecione</option>
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Serviço
            <input
              className={input}
              required
              maxLength={255}
              value={service}
              onChange={(e) => setService(e.target.value)}
            />
          </label>
          <label>
            Categoria
            <select
              className={input}
              value={type}
              onChange={(e) => setType(e.target.value as "vet" | "aesthetic")}
            >
              <option value="aesthetic">Estética</option>
              <option value="vet">Veterinária</option>
            </select>
          </label>
          <label>
            Profissional (opcional)
            <input
              className={input}
              value={professional}
              onChange={(e) => setProfessional(e.target.value)}
            />
          </label>
          <label>
            A partir de
            <input
              className={input}
              required
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label>
            Até a data
            <input
              className={input}
              required
              type="date"
              min={start}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
          <label>
            Disponível a partir de
            <input
              className={input}
              required
              type="time"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label>
            Disponível até
            <input
              className={input}
              required
              type="time"
              value={until}
              onChange={(e) => setUntil(e.target.value)}
            />
          </label>
          <label>
            Duração em minutos
            <input
              className={input}
              required
              type="number"
              min={5}
              max={480}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </label>
          <label>
            Valor combinado
            <input
              className={input}
              required
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
          <button className={button} disabled={busy || loading}>
            Salvar na fila
          </button>
        </form>
      </details>
      <h4 className="font-semibold">
        Aguardando vaga ({entries.filter((e) => e.status === "waiting").length})
      </h4>
      {entries
        .filter((e) => e.status === "waiting")
        .map((e) => (
          <div key={e.id} className="flex gap-3 border-b py-2">
            <span className="flex-1">
              {pets.find((p) => p.id === e.pet_id)?.name ?? "Pet"} ·{" "}
              {e.service_name} · {e.earliest_date} a {e.latest_date}
            </span>
            <button
              disabled={busy}
              onClick={() =>
                void run(() =>
                  waitlistService.update(
                    e.id,
                    { status: "withdrawn" },
                    currentTenant.id,
                  ),
                )
              }
            >
              Retirar da fila
            </button>
          </div>
        ))}
      <h4 className="font-semibold">
        Vagas canceladas e candidatos compatíveis
      </h4>
      {appointments
        .filter(
          (a) => a.status === "canceled" && a.appointment_date >= localDate(),
        )
        .map((slot) => (
          <div key={slot.id} className="border rounded-xl p-3 space-y-2">
            <p>
              {slot.service_name} ·{" "}
              {slot.appointment_date.split("-").reverse().join("/")}{" "}
              {slot.appointment_time.slice(0, 5)} · {slot.professional_name}
            </p>
            {matchingWaitlist(entries, slot).map((e) => (
              <div key={e.id} className="flex flex-wrap gap-2 items-center">
                <span className="flex-1">
                  {pets.find((p) => p.id === e.pet_id)?.name} ·{" "}
                  {e.duration_minutes} min
                </span>
                <button
                  disabled={busy}
                  className={button}
                  onClick={() =>
                    void run(() => bookWaitlistEntry(e.id, slot.id))
                  }
                >
                  Reservar após aceite do tutor
                </button>
              </div>
            ))}
            {matchingWaitlist(entries, slot).length === 0 && (
              <p className="text-sm text-stone-500">
                Nenhum candidato compatível na fila.
              </p>
            )}
          </div>
        ))}
      <details>
        <summary className="font-semibold cursor-pointer">
          Histórico de alterações
        </summary>
        {[...events]
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .slice(0, 30)
          .map((event) => (
            <p key={event.id} className="border-b py-2 text-sm">
              {appointments.find((a) => a.id === event.appointment_id)
                ?.pet_name ?? "Atendimento"}{" "}
              ·{" "}
              {event.event_type === "canceled"
                ? "Cancelado"
                : event.event_type === "rescheduled"
                  ? "Reagendado"
                  : "Status alterado"}{" "}
              · {new Date(event.created_at).toLocaleString("pt-BR")}
              {event.reason && ` · ${event.reason}`}
              {event.event_type === "rescheduled" &&
                ` · ${event.previous_date} ${event.previous_time.slice(0, 5)} → ${event.new_date} ${event.new_time.slice(0, 5)}`}
            </p>
          ))}
      </details>
    </section>
  );
}
