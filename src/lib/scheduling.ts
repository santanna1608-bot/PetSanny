import { requireSupabase, tableService } from "./supabaseClient";
import type { Appointment } from "./supabaseClient";

export interface WaitlistEntry {
  id: string;
  tenant_id: string;
  tutor_id: string;
  pet_id: string;
  service_name: string;
  service_type: "vet" | "aesthetic";
  professional_name: string | null;
  earliest_date: string;
  latest_date: string;
  earliest_time: string;
  latest_time: string;
  duration_minutes: number;
  price: number;
  status: "waiting" | "booked" | "withdrawn";
  appointment_id: string | null;
  created_at?: string;
}
export const waitlistService = tableService<WaitlistEntry>(
  "appointment_waitlist",
);
export interface AppointmentEvent {
  id: string;
  tenant_id: string;
  appointment_id: string;
  event_type: string;
  previous_date: string;
  previous_time: string;
  new_date: string;
  new_time: string;
  previous_status: string;
  new_status: string;
  reason: string | null;
  created_at: string;
}
export const appointmentEventsService =
  tableService<AppointmentEvent>("appointment_events");

export function matchingWaitlist(entries: WaitlistEntry[], slot: Appointment) {
  return entries
    .filter(
      (entry) =>
        entry.status === "waiting" &&
        entry.tenant_id === slot.tenant_id &&
        entry.service_type === slot.service_type &&
        entry.service_name.trim().toLocaleLowerCase() ===
          slot.service_name.trim().toLocaleLowerCase() &&
        (!entry.professional_name ||
          entry.professional_name.trim().toLocaleLowerCase() ===
            slot.professional_name.trim().toLocaleLowerCase()) &&
        entry.earliest_date <= slot.appointment_date &&
        entry.latest_date >= slot.appointment_date &&
        entry.earliest_time.slice(0, 5) <= slot.appointment_time.slice(0, 5) &&
        minutes(slot.appointment_time) + entry.duration_minutes <=
          minutes(entry.latest_time) &&
        entry.duration_minutes <= (slot.duration_minutes ?? 60),
    )
    .sort(
      (a, b) =>
        (a.created_at ?? "").localeCompare(b.created_at ?? "") ||
        a.id.localeCompare(b.id),
    );
}
function minutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export async function rescheduleAppointment(
  id: string,
  date: string,
  time: string,
  duration: number,
) {
  if (
    !date ||
    !time ||
    !Number.isInteger(duration) ||
    duration < 5 ||
    duration > 480
  )
    throw new Error("Informe data, hora e duração de 5 a 480 minutos.");
  const { data, error } = await requireSupabase().rpc(
    "reschedule_appointment",
    { p_id: id, p_date: date, p_time: time, p_duration: duration },
  );
  if (error) throw error;
  return data as Appointment;
}
export async function cancelAppointment(id: string, reason: string) {
  if (!reason.trim() || reason.trim().length > 500)
    throw new Error("Informe o motivo com até 500 caracteres.");
  const { data, error } = await requireSupabase().rpc("cancel_appointment", {
    p_id: id,
    p_reason: reason.trim(),
  });
  if (error) throw error;
  return data as Appointment;
}
export async function bookWaitlistEntry(
  id: string,
  canceledAppointmentId: string,
) {
  const { data, error } = await requireSupabase().rpc("book_waitlist_entry", {
    p_entry: id,
    p_slot: canceledAppointmentId,
  });
  if (error) throw error;
  return data as Appointment;
}
