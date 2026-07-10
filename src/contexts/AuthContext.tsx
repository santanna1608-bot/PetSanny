import React, { createContext, useContext, useState, useEffect } from 'react';
import realSupabase, { isMockClient } from '../lib/supabaseClient';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
    tenant_id: string;
    is_super_admin?: boolean;
    phone?: string;
    avatar_url?: string;
  };
}

export interface AuthSession {
  user: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerTenant: (params: {
    email: string;
    password: string;
    name: string;
    tenantName: string;
    tenantLocation: string;
    plan: 'Bronze' | 'Silver' | 'Gold';
  }) => Promise<void>;
  updateProfile: (updates: {
    name?: string;
    phone?: string;
    avatar_url?: string;
    email?: string;
    password?: string;
  }) => Promise<void>;
  isMock: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Contas fictícias para simular o login no modo de demonstração
const MOCK_ACCOUNTS = [
  {
    email: 'matriz@petsanny.com',
    password: '123456',
    user: {
      id: 'mock-user-1',
      email: 'matriz@petsanny.com',
      user_metadata: {
        name: 'Gestor Sanny Matriz',
        tenant_id: 'tenant-clinica-sanny-1',
        is_super_admin: false
      }
    }
  },
  {
    email: 'filial@petsanny.com',
    password: '123456',
    user: {
      id: 'mock-user-2',
      email: 'filial@petsanny.com',
      user_metadata: {
        name: 'Gestor Sanny Filial',
        tenant_id: 'tenant-clinica-sanny-2',
        is_super_admin: false
      }
    }
  },
  {
    email: 'superadmin@petsanny.com',
    password: '123456',
    user: {
      id: 'mock-user-super',
      email: 'superadmin@petsanny.com',
      user_metadata: {
        name: 'Super Administrador',
        tenant_id: 'tenant-clinica-sanny-1',
        is_super_admin: true
      }
    }
  }
];

const getMockAccounts = () => {
  const cached = localStorage.getItem('petsanny_mock_accounts');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error('Erro ao ler mock accounts do cache:', e);
    }
  }
  localStorage.setItem('petsanny_mock_accounts', JSON.stringify(MOCK_ACCOUNTS));
  return [...MOCK_ACCOUNTS];
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isMockClient && realSupabase) {
      // 1. Caso real: escutar alterações no estado de autenticação do Supabase
      realSupabase.auth.getSession().then(({ data: { session: supabaseSession } }) => {
        if (supabaseSession?.user) {
          const u: AuthUser = {
            id: supabaseSession.user.id,
            email: supabaseSession.user.email || '',
            user_metadata: {
              name: supabaseSession.user.user_metadata?.name || 'Gestor Sanny',
              tenant_id: supabaseSession.user.user_metadata?.tenant_id || '',
              is_super_admin: !!supabaseSession.user.user_metadata?.is_super_admin,
              phone: supabaseSession.user.user_metadata?.phone || '',
              avatar_url: supabaseSession.user.user_metadata?.avatar_url || ''
            }
          };
          setUser(u);
          setSession({ user: u });
        } else {
          setUser(null);
          setSession(null);
        }
        setLoading(false);
      });

      const { data: { subscription } } = realSupabase.auth.onAuthStateChange((_event, supabaseSession) => {
        if (supabaseSession?.user) {
          const u: AuthUser = {
            id: supabaseSession.user.id,
            email: supabaseSession.user.email || '',
            user_metadata: {
              name: supabaseSession.user.user_metadata?.name || 'Gestor Sanny',
              tenant_id: supabaseSession.user.user_metadata?.tenant_id || '',
              is_super_admin: !!supabaseSession.user.user_metadata?.is_super_admin,
              phone: supabaseSession.user.user_metadata?.phone || '',
              avatar_url: supabaseSession.user.user_metadata?.avatar_url || ''
            }
          };
          setUser(u);
          setSession({ user: u });
        } else {
          setUser(null);
          setSession(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // 2. Caso mock: recuperar do localStorage
      const cachedSession = localStorage.getItem('petsanny_session');
      if (cachedSession) {
        try {
          const parsedSession = JSON.parse(cachedSession) as AuthSession;
          setSession(parsedSession);
          setUser(parsedSession.user);
        } catch (e) {
          console.error('Erro ao recuperar sessão mockada do cache:', e);
          localStorage.removeItem('petsanny_session');
        }
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (!isMockClient && realSupabase) {
        // Login Real Supabase
        const { data, error } = await realSupabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (!data.user) throw new Error('Falha ao autenticar usuário');

        // Validar se o usuário possui tenant_id configurado no banco/JWT
        const tenantId = data.user.user_metadata?.tenant_id;
        if (!tenantId) {
          console.warn('Usuário autenticado sem tenant_id associado nos metadados.');
        }

        // Recarrega a página para inicializar o app com a nova sessão limpa
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        // Login Simulado/Mock
        const accounts = getMockAccounts();
        const account = accounts.find(
          (acc: any) => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
        );
        if (!account) {
          throw new Error('E-mail ou senha inválidos para simulação.');
        }

        const newSession: AuthSession = { user: account.user };
        localStorage.setItem('petsanny_session', JSON.stringify(newSession));
        setSession(newSession);
        setUser(account.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const registerTenant = async (params: {
    email: string;
    password: string;
    name: string;
    tenantName: string;
    tenantLocation: string;
    plan: 'Bronze' | 'Silver' | 'Gold';
  }) => {
    setLoading(true);
    try {
      const tenantId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9) + '-' + Math.random().toString(36).substring(2, 9);
      
      if (!isMockClient && realSupabase) {
        // 1. Caso Real Supabase Auth SignUp
        const { data, error } = await realSupabase.auth.signUp({
          email: params.email,
          password: params.password,
          options: {
            data: {
              name: params.name,
              tenant_id: tenantId,
              is_super_admin: false
            }
          }
        });
        if (error) throw error;
        if (!data.user) throw new Error('Erro ao cadastrar usuário no Supabase');

        // 2. Salva o novo tenant no banco real
        const { error: tenantError } = await realSupabase
          .from('tenants')
          .insert({
            id: tenantId,
            name: params.tenantName,
            location: params.tenantLocation,
            plan: params.plan,
            status: 'trial',
            price: 97.00,
            renewal_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            payment_method: 'pix',
            owner_name: params.name,
            owner_email: params.email
          });
        
        if (tenantError) {
          console.error('Erro ao cadastrar tabela de tenant:', tenantError);
        }
      } else {
        // 2. Caso Simulado Mock
        const accounts = getMockAccounts();
        if (accounts.some((acc: any) => acc.email.toLowerCase() === params.email.toLowerCase())) {
          throw new Error('Este e-mail corporativo já está cadastrado.');
        }

        // Recuperar e Atualizar Tenants Locais
        const cachedTenants = localStorage.getItem('petsanny_tenants');
        let localTenants = [];
        if (cachedTenants) {
          localTenants = JSON.parse(cachedTenants);
        }
        
        const newTenant = {
          id: tenantId,
          name: params.tenantName,
          location: params.tenantLocation,
          primaryColor: params.plan === 'Gold' ? 'olive' : params.plan === 'Silver' ? 'terracotta' : 'olive',
          plan: params.plan,
          status: 'trial' as const,
          price: 97.00,
          renewalDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          paymentMethod: 'pix' as const,
          ownerName: params.name,
          ownerEmail: params.email
        };
        localTenants.push(newTenant);
        localStorage.setItem('petsanny_tenants', JSON.stringify(localTenants));

        // Adicionar Nova Conta Mock
        const newMockAccount = {
          email: params.email,
          password: params.password,
          user: {
            id: 'mock-user-' + Math.random().toString(36).substring(2, 9),
            email: params.email,
            user_metadata: {
              name: params.name,
              tenant_id: tenantId,
              is_super_admin: false
            }
          }
        };
        accounts.push(newMockAccount);
        localStorage.setItem('petsanny_mock_accounts', JSON.stringify(accounts));

        // Iniciar Sessão
        const newSession: AuthSession = { user: newMockAccount.user };
        localStorage.setItem('petsanny_session', JSON.stringify(newSession));
        setSession(newSession);
        setUser(newMockAccount.user);

        // Recarrega a página para inicializar o AppointmentsContext com o novo tenant
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: {
    name?: string;
    phone?: string;
    avatar_url?: string;
    email?: string;
    password?: string;
  }) => {
    setLoading(true);
    try {
      if (!isMockClient && realSupabase) {
        // 1. Caso Real Supabase Auth Update
        const profileUpdates: any = {
          data: {
            name: updates.name,
            phone: updates.phone,
            avatar_url: updates.avatar_url
          }
        };
        
        if (updates.email) profileUpdates.email = updates.email;
        if (updates.password) profileUpdates.password = updates.password;

        const { data, error } = await realSupabase.auth.updateUser(profileUpdates);
        if (error) throw error;
        if (!data.user) throw new Error('Falha ao atualizar perfil no Supabase');
      } else {
        // 2. Caso Simulado Mock
        if (!user) throw new Error('Nenhum usuário autenticado');

        const accounts = getMockAccounts();
        const accountIdx = accounts.findIndex((acc: any) => acc.user.id === user.id);
        if (accountIdx === -1) throw new Error('Conta não localizada no cache');

        const currentAccount = accounts[accountIdx];
        
        // Atualiza email
        const updatedEmail = updates.email || currentAccount.email;
        if (updates.email && updates.email !== currentAccount.email) {
          if (accounts.some((acc: any) => acc.user.id !== user.id && acc.email.toLowerCase() === updates.email!.toLowerCase())) {
            throw new Error('Este e-mail já está sendo utilizado por outra conta.');
          }
        }

        const updatedPassword = updates.password || currentAccount.password;

        const updatedUserMetadata = {
          ...currentAccount.user.user_metadata,
          name: updates.name !== undefined ? updates.name : currentAccount.user.user_metadata.name,
          phone: updates.phone !== undefined ? updates.phone : currentAccount.user.user_metadata.phone,
          avatar_url: updates.avatar_url !== undefined ? updates.avatar_url : currentAccount.user.user_metadata.avatar_url
        };

        const updatedUser = {
          ...currentAccount.user,
          email: updatedEmail,
          user_metadata: updatedUserMetadata
        };

        const updatedAccount = {
          email: updatedEmail,
          password: updatedPassword,
          user: updatedUser
        };

        accounts[accountIdx] = updatedAccount;
        localStorage.setItem('petsanny_mock_accounts', JSON.stringify(accounts));

        // Salvar na sessão e no estado
        const newSession = { user: updatedUser };
        localStorage.setItem('petsanny_session', JSON.stringify(newSession));
        setSession(newSession);
        setUser(updatedUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (!isMockClient && realSupabase) {
        // Logout Real no Supabase
        const { error } = await realSupabase.auth.signOut();
        if (error) {
          console.warn('Erro reportado pelo Supabase durante signOut:', error);
        }
      }
    } catch (err) {
      console.error('Exceção no logout do Supabase:', err);
    } finally {
      // Força a limpeza completa do localStorage (incluindo tokens do Supabase e mocks)
      localStorage.clear();
      setUser(null);
      setSession(null);
      setLoading(false);
      // Recarrega a página para reiniciar todos os estados do zero
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, logout, registerTenant, updateProfile, isMock: isMockClient }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
