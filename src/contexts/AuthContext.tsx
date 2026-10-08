import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { resolveUser, signOut } from "../lib/authAccess";
import type { AuthUser } from "../lib/authAccess";
export type { AuthUser, Membership } from "../lib/authAccess";
import type { User } from "@supabase/supabase-js";
import supabase, { requireSupabase } from "../lib/supabaseClient";
export interface AuthSession {
  user: AuthUser;
}
interface TenantDraft {
  tenantName: string;
  tenantLocation: string;
  name: string;
  plan: "Bronze" | "Silver" | "Gold";
}
interface RegisterParams extends TenantDraft {
  email: string;
  password: string;
}
interface ProfileUpdates {
  name?: string;
  phone?: string;
  avatar_url?: string;
  email?: string;
  password?: string;
}
interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  accessError: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerTenant: (
    params: RegisterParams,
  ) => Promise<{ needsEmailConfirmation: boolean }>;
  createTenant: (draft: TenantDraft) => Promise<void>;
  updateProfile: (updates: ProfileUpdates) => Promise<void>;
  retryAccess: () => Promise<void>;
  isMock: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);
  const generation = useRef(0);
  const mounted = useRef(false);
  const applyAccount = useCallback(async (account: User | null) => {
    const version = ++generation.current;
    if (!account) {
      setUser(null);
      setAccessError(null);
      setLoading(false);
      return;
    }
    try {
      const resolved = await resolveUser(account);
      if (mounted.current && generation.current === version) {
        setUser((previous) =>
          previous && JSON.stringify(previous) === JSON.stringify(resolved)
            ? previous
            : resolved,
        );
        setAccessError(null);
      }
    } catch {
      if (mounted.current && generation.current === version) {
        setUser(null);
        setAccessError(
          "Não foi possível carregar seu acesso à clínica. Tente novamente.",
        );
      }
    } finally {
      if (mounted.current && generation.current === version) setLoading(false);
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    if (!supabase) {
      setLoading(false);
      return () => {
        mounted.current = false;
      };
    }
    // Chamadas à API fora do callback de autenticação evitam deadlocks.
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        void applyAccount(session?.user || null);
      }, 0);
      timers.add(timer);
    });
    return () => {
      mounted.current = false;
      generation.current++;
      subscription.unsubscribe();
      timers.forEach(clearTimeout);
    };
  }, [applyAccount]);
  const retryAccess = useCallback(async () => {
    setLoading(true);
    const { data, error } = await requireSupabase().auth.getUser();
    if (error) {
      setLoading(false);
      throw error;
    }
    await applyAccount(data.user);
  }, [applyAccount]);
  const login = async (email: string, password: string) => {
    const { error } = await requireSupabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
  };
  const registerTenant = async (params: RegisterParams) => {
    const { data, error } = await requireSupabase().auth.signUp({
      email: params.email.trim(),
      password: params.password,
      options: {
        emailRedirectTo: `${window.location.origin}/#auth`,
        data: {
          name: params.name,
          clinic_draft: {
            tenantName: params.tenantName,
            tenantLocation: params.tenantLocation,
            plan: params.plan,
          },
        },
      },
    });
    if (error) throw error;
    return { needsEmailConfirmation: !data.session };
  };
  const createTenant = async (draft: TenantDraft) => {
    const { error } = await requireSupabase().rpc("bootstrap_tenant", {
      p_name: draft.tenantName,
      p_location: draft.tenantLocation,
      p_owner_name: draft.name,
      p_plan: draft.plan,
    });
    if (error) throw error;
    await retryAccess();
  };
  const updateProfile = async (updates: ProfileUpdates) => {
    const { email, password, ...metadata } = updates;
    const { error } = await requireSupabase().auth.updateUser({
      data: metadata,
      ...(email ? { email } : {}),
      ...(password ? { password } : {}),
    });
    if (error) throw error;
    await retryAccess();
  };
  const logout = async () => {
    await signOut();
    generation.current++;
    setUser(null);
    setAccessError(null);
    // Supabase remove somente seus tokens; cadastros e preferências são preservados.
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        session: user ? { user } : null,
        loading,
        accessError,
        login,
        logout,
        registerTenant,
        createTenant,
        updateProfile,
        retryAccess,
        isMock: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
};
