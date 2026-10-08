import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Appointment } from "../lib/supabaseClient";
import { appointmentsService, requireSupabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";
export interface Tenant {
  id: string;
  name: string;
  location: string;
  primaryColor: string;
  plan?: "Bronze" | "Silver" | "Gold";
  status?: "active" | "trial" | "suspended" | "canceled";
  price?: number;
  renewalDate?: string;
  paymentMethod?: "credit_card" | "pix" | "boleto";
  ownerName?: string;
  ownerEmail?: string;
}
const EMPTY_TENANT: Tenant = {
  id: "",
  name: "",
  location: "",
  primaryColor: "olive",
};
interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: "success" | "info" | "warning";
}
interface AppointmentsContextType {
  appointments: Appointment[];
  loading: boolean;
  tenantError: string | null;
  currentTenant: Tenant;
  setCurrentTenant: (tenant: Tenant) => void;
  fetchAppointments: () => Promise<void>;
  addAppointment: (
    appointment: Omit<Appointment, "id" | "tenant_id" | "confirmed_at">,
  ) => Promise<void>;
  confirmAppointment: (
    id: string,
    tutorEmail: string,
    petName: string,
  ) => Promise<void>;
  changeAppointmentStatus: (
    id: string,
    status: Appointment["status"],
  ) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  toasts: ToastMessage[];
  addToast: (
    title: string,
    description: string,
    type?: ToastMessage["type"],
  ) => void;
  removeToast: (id: string) => void;
  isMock: boolean;
  tenants: Tenant[];
  updateTenantSubscription: (
    tenantId: string,
    updates: Partial<Tenant>,
  ) => Promise<void>;
  deleteTenantSubscription: (tenantId: string) => Promise<void>;
}
const AppointmentsContext = createContext<AppointmentsContextType | undefined>(
  undefined,
);
export const AppointmentsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenantState] = useState<Tenant>(EMPTY_TENANT);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantError, setTenantError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const activeScope = useRef("");
  const scope = `${user?.id || ""}:${currentTenant.id}`;
  activeScope.current = scope;
  const addToast = useCallback(
    (
      title: string,
      description: string,
      type: ToastMessage["type"] = "success",
    ) => {
      setToasts((prev) => [
        ...prev,
        { id: crypto.randomUUID(), title, description, type },
      ]);
    },
    [],
  );
  const removeToast = useCallback(
    (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    [],
  );
  useEffect(() => {
    let canceled = false;
    setTenants([]);
    setCurrentTenantState(EMPTY_TENANT);
    setAppointments([]);
    setToasts([]);
    setTenantError(null);
    if (!user?.memberships.length || user.is_super_admin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void (async () => {
      try {
        const { data, error } = await requireSupabase()
          .from("tenants")
          .select("*")
          .in(
            "id",
            user.memberships.map((m) => m.tenant_id),
          );
        if (error) throw error;
        const values: Tenant[] = data.map((t) => ({
          id: t.id,
          name: t.name,
          location: t.location || "",
          primaryColor: t.primary_color || "olive",
          plan: t.plan,
          status: t.status,
          price: Number(t.price),
          renewalDate: t.renewal_date,
          paymentMethod: t.payment_method,
          ownerName: t.owner_name,
          ownerEmail: t.owner_email,
        }));
        if (!values.length) throw new Error("Clínica não localizada");
        if (!canceled) {
          setTenants(values);
          setCurrentTenantState(values[0]);
        }
      } catch {
        if (!canceled) {
          setTenantError(
            "Não foi possível carregar sua clínica. Atualize a página para tentar novamente.",
          );
          setLoading(false);
        }
      }
    })();
    return () => {
      canceled = true;
    };
  }, [user]);
  const fetchAppointments = useCallback(async () => {
    if (!user || !currentTenant.id) return;
    const requestedScope = scope;
    setLoading(true);
    try {
      const values = await appointmentsService.list(currentTenant.id);
      if (activeScope.current === requestedScope) setAppointments(values);
    } catch {
      if (activeScope.current === requestedScope) {
        setAppointments([]);
        addToast(
          "Erro de conexão",
          "Não foi possível carregar os agendamentos.",
          "warning",
        );
      }
    } finally {
      if (activeScope.current === requestedScope) setLoading(false);
    }
  }, [user, currentTenant.id, scope, addToast]);
  useEffect(() => {
    setAppointments([]);
    void fetchAppointments();
  }, [fetchAppointments]);
  const setCurrentTenant = (tenant: Tenant) => {
    if (tenants.some((t) => t.id === tenant.id)) setCurrentTenantState(tenant);
  };
  const addAppointment = async (
    appointment: Omit<Appointment, "id" | "tenant_id" | "confirmed_at">,
  ) => {
    const requestedScope = scope;
    try {
      const created = await appointmentsService.create({
        ...appointment,
        tenant_id: currentTenant.id,
        confirmed_at:
          appointment.status === "confirmed" ? new Date().toISOString() : null,
      });
      if (activeScope.current !== requestedScope) return;
      setAppointments((prev) => [...prev, created]);
      addToast(
        "Agendamento criado",
        `Agendamento para ${appointment.pet_name} salvo.`,
      );
    } catch (error) {
      addToast(
        "Erro ao salvar",
        "O agendamento não foi salvo. Tente novamente.",
        "warning",
      );
      throw error;
    }
  };
  const changeAppointmentStatus = async (
    id: string,
    status: Appointment["status"],
  ) => {
    const requestedScope = scope;
    try {
      const updated = await appointmentsService.updateStatus(id, status);
      if (activeScope.current !== requestedScope) return;
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      addToast("Status atualizado", "A alteração foi salva na agenda.");
    } catch {
      addToast(
        "Erro ao atualizar",
        "Não foi possível alterar o agendamento.",
        "warning",
      );
    }
  };
  const confirmAppointment = async (
    id: string,
    _email: string,
    _pet: string,
  ) => {
    await changeAppointmentStatus(id, "confirmed");
  };
  const deleteAppointment = async (id: string) => {
    const requestedScope = scope;
    try {
      await appointmentsService.delete(id);
      if (activeScope.current !== requestedScope) return;
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      addToast("Agendamento removido", "Registro excluído.", "info");
    } catch {
      addToast(
        "Erro ao excluir",
        "Não foi possível excluir o agendamento.",
        "warning",
      );
    }
  };
  const updateTenantSubscription = async (
    _id: string,
    _updates: Partial<Tenant>,
  ) => {
    addToast(
      "Operação indisponível",
      "Assinaturas devem ser gerenciadas pelo serviço de cobrança.",
      "warning",
    );
  };
  const deleteTenantSubscription = async (_id: string) => {
    addToast(
      "Operação indisponível",
      "Cancelamentos devem ser gerenciados pelo serviço de cobrança.",
      "warning",
    );
  };
  return (
    <AppointmentsContext.Provider
      value={{
        appointments,
        loading,
        tenantError,
        currentTenant,
        setCurrentTenant,
        fetchAppointments,
        addAppointment,
        confirmAppointment,
        changeAppointmentStatus,
        deleteAppointment,
        toasts,
        addToast,
        removeToast,
        isMock: false,
        tenants,
        updateTenantSubscription,
        deleteTenantSubscription,
      }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
};
export const useAppointments = () => {
  const context = useContext(AppointmentsContext);
  if (!context)
    throw new Error(
      "useAppointments deve ser usado dentro de AppointmentsProvider",
    );
  return context;
};
