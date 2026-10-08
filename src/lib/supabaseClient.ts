import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL || "";
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
export const configurationError =
  !url || !key
    ? "A conexão do sistema ainda não foi configurada. Entre em contato com o suporte."
    : null;
export const isMockClient = false;
const supabase = configurationError ? null : createClient(url, key);
export function requireSupabase() {
  if (!supabase) throw new Error(configurationError!);
  return supabase;
}
export interface Appointment {
  id: string;
  tenant_id: string;
  tutor_id?: string | null;
  pet_id?: string | null;
  tutor_name: string;
  pet_name: string;
  pet_species: string;
  tutor_email: string;
  service_type: "vet" | "aesthetic";
  service_name: string;
  professional_name: string;
  price: number;
  appointment_date: string;
  appointment_time: string;
  status: "pending" | "confirmed" | "completed";
  confirmed_at: string | null;
  critical_notes: string | null;
  created_at?: string;
}
export interface Tutor {
  id: string;
  tenant_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  crm_stage?: string;
  created_at?: string;
}
export interface Pet {
  id: string;
  tenant_id: string;
  tutor_id: string;
  name: string;
  species: string;
  breed: string | null;
  birth_date: string | null;
  notes?: string | null;
  created_at?: string;
}
export function tableService<Row extends { id: string; tenant_id: string }>(
  table: string,
) {
  return {
    async list(
      tenantId: string,
      filters: Record<string, string> = {},
    ): Promise<Row[]> {
      if (!tenantId) return [];
      let query = requireSupabase()
        .from(table)
        .select("*")
        .eq("tenant_id", tenantId);
      for (const [field, value] of Object.entries(filters))
        query = query.eq(field, value);
      const { data, error } = await query;
      if (error) throw error;
      return data as Row[];
    },
    async create(value: Omit<Row, "id" | "created_at">): Promise<Row> {
      const { data, error } = await requireSupabase()
        .from(table)
        .insert(value as Record<string, unknown>)
        .select()
        .single();
      if (error) throw error;
      return data as Row;
    },
    async update(
      id: string,
      updates: Partial<Omit<Row, "id" | "tenant_id">>,
      tenantId?: string,
    ): Promise<Row> {
      let query = requireSupabase()
        .from(table)
        .update(updates as Record<string, unknown>)
        .eq("id", id);
      if (tenantId) query = query.eq("tenant_id", tenantId);
      const { data, error } = await query.select().single();
      if (error) throw error;
      return data as Row;
    },
    async delete(id: string, tenantId?: string): Promise<boolean> {
      let query = requireSupabase().from(table).delete().eq("id", id);
      if (tenantId) query = query.eq("tenant_id", tenantId);
      const { data, error } = await query.select("id");
      if (error) throw error;
      if (!data?.length)
        throw new Error("Registro não encontrado ou acesso não permitido.");
      return true;
    },
  };
}
const appointmentTable = tableService<Appointment>("appointments");
export const appointmentsService = {
  ...appointmentTable,
  async updateStatus(id: string, status: Appointment["status"]) {
    const updates: Partial<Appointment> = { status };
    if (status === "confirmed") updates.confirmed_at = new Date().toISOString();
    if (status === "pending") updates.confirmed_at = null;
    return appointmentTable.update(id, updates);
  },
};
export const tutorsService = tableService<Tutor>("tutors");
export const petsService = tableService<Pet>("pets");
export default supabase;
