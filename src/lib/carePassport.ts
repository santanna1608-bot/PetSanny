import { tableService } from "./supabaseClient";
import type { Appointment } from "./supabaseClient";
export interface CareProfile {
  id: string;
  tenant_id: string;
  pet_id: string;
  grooming_preferences: string;
  products_used: string;
  behavior_observed: string;
  restrictions: string;
  information_source: "tutor" | "professional";
  recorded_by: string;
  next_return_date: string | null;
  updated_at?: string;
  created_at?: string;
}
export const careService = tableService<CareProfile>("pet_care_profiles");
export function overdueReturns(
  profiles: CareProfile[],
  appointments: Appointment[],
  today: string,
) {
  return profiles
    .filter(
      (p) =>
        p.next_return_date &&
        p.next_return_date <= today &&
        !appointments.some(
          (a) =>
            a.tenant_id === p.tenant_id &&
            a.pet_id === p.pet_id &&
            a.appointment_date >= today &&
            (a.status === "pending" || a.status === "confirmed"),
        ),
    )
    .sort((a, b) =>
      (a.next_return_date ?? "").localeCompare(b.next_return_date ?? ""),
    );
}
