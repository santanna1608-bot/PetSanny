import type { User } from "@supabase/supabase-js";
import { requireSupabase } from "./supabaseClient";
export interface Membership {
  tenant_id: string;
  role: "owner" | "admin" | "staff" | "viewer";
}
export interface AuthUser {
  id: string;
  email: string;
  memberships: Membership[];
  is_super_admin: boolean;
  user_metadata: { name?: string; phone?: string; avatar_url?: string };
}
const resolutions = new Map<string, Promise<AuthUser>>();
export async function resolveUser(account: User): Promise<AuthUser> {
  const pending = resolutions.get(account.id);
  if (pending) return pending;
  const resolution = (async () => {
    const client = requireSupabase();
    const { data: platformAdmin, error: platformError } = await client.rpc(
      "current_platform_admin",
    );
    if (platformError) throw platformError;
    const isPlatformAdmin = platformAdmin === true;
    const readMemberships = async () => {
      const { data, error } = await client
        .from("tenant_memberships")
        .select("tenant_id,role")
        .eq("user_id", account.id)
        .eq("active", true);
      if (error) throw error;
      return data as Membership[];
    };
    let memberships = await readMemberships();
    const draft = account.user_metadata?.clinic_draft;
    if (
      !memberships.length &&
      !isPlatformAdmin &&
      account.email_confirmed_at &&
      draft?.tenantName
    ) {
      const { error } = await client.rpc("bootstrap_tenant", {
        p_name: draft.tenantName,
        p_location: draft.tenantLocation || "",
        p_owner_name: account.user_metadata?.name || "",
        p_plan: ["Bronze", "Silver", "Gold"].includes(draft.plan)
          ? draft.plan
          : "Bronze",
      });
      if (error) throw error;
      memberships = await readMemberships();
    }
    return {
      id: account.id,
      email: account.email || "",
      memberships,
      is_super_admin: isPlatformAdmin,
      user_metadata: {
        name: account.user_metadata?.name || "",
        phone: account.user_metadata?.phone || "",
        avatar_url: account.user_metadata?.avatar_url || "",
      },
    };
  })();
  resolutions.set(account.id, resolution);
  try {
    return await resolution;
  } finally {
    resolutions.delete(account.id);
  }
}

export async function signOut() {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}
