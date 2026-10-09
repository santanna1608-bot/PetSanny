import { requireSupabase, tableService } from "./supabaseClient";
export interface TutorAppointment {
  clinic_name: string;
  pet_name: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  care_stage: string;
  expires_at: string;
}
export interface AppointmentRequest {
  id: string;
  tenant_id: string;
  appointment_id: string;
  action: "cancel" | "reschedule";
  desired_date: string | null;
  desired_time: string | null;
  reason: string;
  status: "pending" | "handled" | "declined";
  created_at: string;
}
export const appointmentRequestsService = tableService<AppointmentRequest>(
  "appointment_requests",
);
export async function issueTutorLink(id: string, origin: string) {
  const { data, error } = await requireSupabase().rpc(
    "issue_appointment_link",
    { p_appointment: id },
  );
  if (error) throw error;
  if (typeof data !== "string" || !/^[a-f0-9]{64}$/.test(data))
    throw new Error("Não foi possível gerar o link");
  return `${origin}/#visit=${data}`;
}
export async function revokeTutorLinks(id: string) {
  const { error } = await requireSupabase().rpc("revoke_appointment_links", {
    p_appointment: id,
  });
  if (error) throw error;
}
export async function readTutorAppointment(token: string) {
  const { data, error } = await requireSupabase().rpc(
    "read_tutor_appointment",
    { p_token: token },
  );
  if (error) throw error;
  return data as TutorAppointment;
}
export async function respondTutorAppointment(
  token: string,
  action: "confirm" | "cancel" | "reschedule",
  date?: string,
  time?: string,
  reason?: string,
) {
  const { error } = await requireSupabase().rpc("respond_tutor_appointment", {
    p_token: token,
    p_action: action,
    p_date: date || null,
    p_time: time || null,
    p_reason: reason ?? "",
  });
  if (error) throw error;
}
