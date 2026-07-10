import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Appointment } from '../lib/supabaseClient';
import realSupabase, { appointmentsService, isMockClient } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

export interface Tenant {
  id: string;
  name: string;
  location: string;
  primaryColor: string;
  plan?: 'Bronze' | 'Silver' | 'Gold';
  status?: 'active' | 'trial' | 'suspended' | 'canceled';
  price?: number;
  renewalDate?: string;
  paymentMethod?: 'credit_card' | 'pix' | 'boleto';
  ownerName?: string;
  ownerEmail?: string;
}

export const DEFAULT_TENANTS: Tenant[] = [
  {
    id: 'tenant-clinica-sanny-1',
    name: 'PetSanny Matriz - Centro',
    location: 'Av. Paulista, 1000 - São Paulo',
    primaryColor: 'olive',
    plan: 'Gold',
    status: 'active',
    price: 299.90,
    renewalDate: '2026-07-15',
    paymentMethod: 'credit_card',
    ownerName: 'Claudio Antunes',
    ownerEmail: 'claudio.matriz@petsanny.com'
  },
  {
    id: 'tenant-clinica-sanny-2',
    name: 'PetSanny Filial - Jardins',
    location: 'Rua Oscar Freire, 500 - São Paulo',
    primaryColor: 'terracotta',
    plan: 'Silver',
    status: 'trial',
    price: 199.90,
    renewalDate: '2026-07-22',
    paymentMethod: 'pix',
    ownerName: 'Marta Souza',
    ownerEmail: 'marta.filial@petsanny.com'
  },
  {
    id: 'tenant-clinica-sanny-3',
    name: 'PetSanny Premium - Moema',
    location: 'Av. Ibirapuera, 1200 - São Paulo',
    primaryColor: 'olive',
    plan: 'Gold',
    status: 'active',
    price: 349.90,
    renewalDate: '2026-07-18',
    paymentMethod: 'boleto',
    ownerName: 'Roberto Alves',
    ownerEmail: 'roberto.premium@petsanny.com'
  }
];

export const TENANTS = DEFAULT_TENANTS;

interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'info' | 'warning';
}

interface AppointmentsContextType {
  appointments: Appointment[];
  loading: boolean;
  currentTenant: Tenant;
  setCurrentTenant: (tenant: Tenant) => void;
  fetchAppointments: () => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'tenant_id' | 'confirmed_at'>) => Promise<void>;
  confirmAppointment: (id: string, tutorEmail: string, petName: string) => Promise<void>;
  changeAppointmentStatus: (id: string, status: 'pending' | 'confirmed' | 'completed') => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  toasts: ToastMessage[];
  addToast: (title: string, description: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  isMock: boolean;
  tenants: Tenant[];
  updateTenantSubscription: (tenantId: string, updates: Partial<Tenant>) => Promise<void>;
  deleteTenantSubscription: (tenantId: string) => Promise<void>;
}

const isUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

export const AppointmentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Lista de Tenants gerenciada dinamicamente
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const cached = localStorage.getItem('petsanny_tenants');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('Erro ao ler tenants cache:', e);
      }
    }
    localStorage.setItem('petsanny_tenants', JSON.stringify(DEFAULT_TENANTS));
    return DEFAULT_TENANTS;
  });

  const [currentTenant, setCurrentTenantState] = useState<Tenant>(tenants[0]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, description: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Carrega agendamentos sempre que o tenant atual muda ou usuário loga
  const fetchAppointments = async () => {
    if (!user) {
      setAppointments([]);
      return;
    }
    try {
      setLoading(true);
      const data = await appointmentsService.list(currentTenant.id);
      setAppointments(data);
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err);
      addToast('Erro de Conexão', 'Não foi possível carregar os agendamentos.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Sincroniza o tenant com o usuário logado
  useEffect(() => {
    if (user) {
      const tenantId = user.user_metadata.tenant_id;
      const matchedTenant = tenants.find(t => t.id === tenantId);
      
      if (matchedTenant) {
        setCurrentTenantState(matchedTenant);
      } else {
        // Fallback temporário enquanto carrega do Supabase
        const fallbackTenant: Tenant = {
          id: tenantId,
          name: 'Carregando clínica...',
          location: 'Carregando endereço...',
          primaryColor: 'olive'
        };
        setCurrentTenantState(fallbackTenant);

        if (!isMockClient && realSupabase) {
          realSupabase
            .from('tenants')
            .select('*')
            .eq('id', tenantId)
            .single()
            .then(({ data, error }) => {
              if (error) {
                console.error('Erro ao buscar dados do tenant no Supabase:', error);
                // Fallback persistente em caso de erro
                setCurrentTenantState({
                  id: tenantId,
                  name: 'Minha Clínica',
                  location: 'Clínica Registrada',
                  primaryColor: 'olive'
                });
              } else if (data) {
                const fetchedTenant: Tenant = {
                  id: data.id,
                  name: data.name,
                  location: data.location || 'Sem endereço cadastrado',
                  primaryColor: data.primary_color || 'olive',
                  plan: data.plan,
                  status: data.status,
                  price: data.price,
                  renewalDate: data.renewal_date,
                  paymentMethod: data.payment_method,
                  ownerName: data.owner_name,
                  ownerEmail: data.owner_email
                };

                // Adiciona na lista local de tenants e define como ativo
                setTenants((prev) => {
                  const exists = prev.some(t => t.id === fetchedTenant.id);
                  if (!exists) {
                    return [...prev, fetchedTenant];
                  }
                  return prev;
                });
                setCurrentTenantState(fetchedTenant);
              }
            });
        } else {
          // No modo de simulação mock local, usa os dados do usuário para o fallback
          setCurrentTenantState({
            id: tenantId,
            name: user.user_metadata.name || 'Minha Clínica',
            location: 'Clínica Registrada',
            primaryColor: 'olive'
          });
        }
      }
    } else {
      setAppointments([]);
    }
  }, [user, tenants]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [currentTenant, user]);

  // Carrega todos os tenants caso seja Super Admin no modo Supabase Real
  useEffect(() => {
    if (user && user.user_metadata?.is_super_admin && !isMockClient && realSupabase) {
      realSupabase
        .from('tenants')
        .select('*')
        .then(({ data, error }) => {
          if (error) {
            console.error('Erro ao buscar todos os tenants no Supabase:', error);
          } else if (data) {
            const fetchedTenants: Tenant[] = data.map((t: any) => ({
              id: t.id,
              name: t.name,
              location: t.location || 'Sem endereço cadastrado',
              primaryColor: t.primary_color || 'olive',
              plan: t.plan,
              status: t.status,
              price: t.price,
              renewalDate: t.renewal_date,
              paymentMethod: t.payment_method,
              ownerName: t.owner_name,
              ownerEmail: t.owner_email
            }));
            setTenants(fetchedTenants);
            localStorage.setItem('petsanny_tenants', JSON.stringify(fetchedTenants));
          }
        });
    }
  }, [user]);

  const setCurrentTenant = (tenant: Tenant) => {
    // No modo Supabase Real, o tenant é fixo pelo login do usuário (RLS), a menos que seja Super Admin
    const isSuperAdmin = user?.user_metadata?.is_super_admin;
    if (!isMockClient && user && !isSuperAdmin) {
      addToast('Ação Bloqueada', 'No modo real, seu tenant é fixado pelo login do seu usuário.', 'warning');
      return;
    }
    setCurrentTenantState(tenant);
    addToast('Tenant Alterado', `Visualizando dados da clínica: ${tenant.name}`, 'info');
  };

  const addAppointment = async (appointment: Omit<Appointment, 'id' | 'tenant_id' | 'confirmed_at'>) => {
    try {
      const data = await appointmentsService.create({
        ...appointment,
        tenant_id: currentTenant.id,
        confirmed_at: appointment.status === 'confirmed' ? new Date().toISOString() : null
      });
      setAppointments((prev) => [...prev, data]);
      addToast('Agendamento Criado', `Agendamento para ${appointment.pet_name} cadastrado com sucesso.`);
    } catch (err) {
      console.error('Erro ao criar agendamento:', err);
      addToast('Erro ao Salvar', 'Não foi possível salvar o agendamento.', 'warning');
    }
  };

  const confirmAppointment = async (id: string, tutorEmail: string, petName: string) => {
    try {
      // Atualiza no banco
      const updated = await appointmentsService.updateStatus(id, 'confirmed');
      setAppointments((prev) => prev.map((app) => (app.id === id ? updated : app)));
      
      // Simulação do gatilho automático / webhook
      addToast(
        'Agendamento Confirmado!', 
        `Status alterado para Confirmado. Notificação enviada para ${petName}.`
      );

      // Simulação de gatilho do Webhook (Supabase Edge Function) após 1.2 segundos
      setTimeout(() => {
        addToast(
          'Gatilho Webhook Ativado 🚀',
          `1. E-mail de confirmação enviado para o tutor (${tutorEmail}).\n2. Evento criado no Google Agenda do profissional.`,
          'info'
        );
      }, 1200);

    } catch (err) {
      console.error('Erro ao confirmar agendamento:', err);
      addToast('Erro ao Confirmar', 'Não foi possível atualizar o agendamento.', 'warning');
    }
  };

  const changeAppointmentStatus = async (id: string, status: 'pending' | 'confirmed' | 'completed') => {
    try {
      const updated = await appointmentsService.updateStatus(id, status);
      setAppointments((prev) => prev.map((app) => (app.id === id ? updated : app)));
      
      if (status === 'confirmed') {
        const target = appointments.find(a => a.id === id);
        if (target) {
          confirmAppointment(id, target.tutor_email, target.pet_name);
          return;
        }
      }

      addToast(
        'Status Atualizado', 
        `Agendamento atualizado para "${status === 'completed' ? 'Concluído' : 'Pendente'}" com sucesso.`
      );
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      addToast('Erro ao Atualizar', 'Não foi possível alterar o status.', 'warning');
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await appointmentsService.delete(id);
      setAppointments((prev) => prev.filter((app) => app.id !== id));
      addToast('Agendamento Removido', 'O registro foi excluído do sistema.', 'info');
    } catch (err) {
      console.error('Erro ao excluir agendamento:', err);
      addToast('Erro ao Excluir', 'Não foi possível excluir o agendamento.', 'warning');
    }
  };

  const updateTenantSubscription = async (tenantId: string, updates: Partial<Tenant>) => {
    try {
      if (!isMockClient && realSupabase && isUUID(tenantId)) {
        const { error } = await realSupabase
          .from('tenants')
          .update({
            plan: updates.plan,
            status: updates.status,
            price: updates.price,
            renewal_date: updates.renewalDate,
            payment_method: updates.paymentMethod,
            owner_name: updates.ownerName,
            owner_email: updates.ownerEmail
          })
          .eq('id', tenantId);

        if (error) throw error;
      }

      const updatedTenants = tenants.map(t => {
        if (t.id === tenantId) {
          return { ...t, ...updates };
        }
        return t;
      });
      setTenants(updatedTenants);
      localStorage.setItem('petsanny_tenants', JSON.stringify(updatedTenants));

      if (currentTenant.id === tenantId) {
        const target = updatedTenants.find(t => t.id === tenantId);
        if (target) setCurrentTenantState(target);
      }
      
      addToast('Assinatura Atualizada', `O plano/status da clínica foi atualizado com sucesso.`, 'success');
    } catch (err) {
      console.error('Erro ao atualizar tenant no Supabase:', err);
      addToast('Erro ao Atualizar', 'Não foi possível salvar as alterações de assinatura no banco de dados.', 'warning');
    }
  };

  const deleteTenantSubscription = async (tenantId: string) => {
    try {
      if (!isMockClient && realSupabase && isUUID(tenantId)) {
        const { error } = await realSupabase
          .from('tenants')
          .delete()
          .eq('id', tenantId);
        
        if (error) throw error;
      }

      const updatedTenants = tenants.filter(t => t.id !== tenantId);
      setTenants(updatedTenants);
      localStorage.setItem('petsanny_tenants', JSON.stringify(updatedTenants));

      // Se a clínica deletada for a ativa, muda para a primeira disponível
      if (currentTenant.id === tenantId) {
        if (updatedTenants.length > 0) {
          setCurrentTenantState(updatedTenants[0]);
        }
      }

      addToast('Clínica Excluída', 'A assinatura e cadastro da clínica foram removidos.', 'info');
    } catch (err) {
      console.error('Erro ao excluir tenant:', err);
      addToast('Erro ao Excluir', 'Não foi possível remover a clínica do sistema.', 'warning');
    }
  };

  return (
    <AppointmentsContext.Provider
      value={{
        appointments,
        loading,
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
        isMock: isMockClient,
        tenants: tenants,
        updateTenantSubscription,
        deleteTenantSubscription
      }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentsContext);
  if (context === undefined) {
    throw new Error('useAppointments deve ser usado dentro de um AppointmentsProvider');
  }
  return context;
};
