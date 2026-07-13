import { useState, useEffect, useRef } from 'react';
import { AppointmentsProvider, useAppointments } from './contexts/AppointmentsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Login } from './components/Login';
import { LandingPage } from './components/LandingPage';
import { CustomersAndPets } from './components/CustomersAndPets';
import { Sidebar } from './components/Sidebar';
import { DashboardPremium } from './components/DashboardPremium';
import { AgendaCalendar } from './components/AgendaCalendar';
import { OperationalControl } from './components/OperationalControl';
import { CriticalAlerts } from './components/CriticalAlerts';
import { AppointmentModal } from './components/AppointmentModal';
import { ToastContainer } from './components/ToastContainer';
import { SaaSSubscriptions } from './components/SaaSSubscriptions';
import { Settings } from './components/Settings';
import { LanguageDropdown } from './components/LanguageDropdown';
import { CRMControl } from './components/CRMControl';
import { InventoryAndFinance } from './components/InventoryAndFinance';
import { AutomationsCenter } from './components/AutomationsCenter';
import { PetSannyAI } from './components/PetSannyAI';
import logoImg from './assets/logo.png';
import { 
  Plus, 
  Sparkles,
  Building,
  AlertCircle,
  Sun,
  Moon,
  Menu
} from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Controla a view baseada no hash da URL (persiste no refresh)
  const getViewFromHash = (): 'landing' | 'auth' => {
    const hash = window.location.hash;
    if (hash === '#auth' || hash === '#register') return 'auth';
    return 'landing';
  };

  const [currentView, setCurrentViewRaw] = useState<'landing' | 'auth'>(getViewFromHash);
  const [initialAuthMode, setInitialAuthMode] = useState<'login' | 'register'>(() => {
    return window.location.hash === '#register' ? 'register' : 'login';
  });

  // Controla se usuário autenticado quer ver o dashboard (ignora landing salva)
  // Inicializa como true apenas se o hash atual for explicitamente #dashboard
  const [forceDashboard, setForceDashboard] = useState(() => {
    return window.location.hash === '#dashboard';
  });

  const setCurrentView = (view: 'landing' | 'auth', mode: 'login' | 'register' = 'login') => {
    if (view === 'auth') {
      window.location.hash = mode === 'register' ? '#register' : '#auth';
    } else {
      // Se não for auth e também não quisermos forçar o dashboard, limpa o hash
      if (!forceDashboard) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
    setCurrentViewRaw(view);
  };

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { currentTenant, isMock } = useAppointments();
  const { user, loading: authLoading, logout } = useAuth();
  const { t } = useLanguage();

  const isFirstLoad = useRef(true);

  // Se a página inicializar/atualizar nas URLs de login ou cadastro (#auth ou #register) e o usuário já estiver logado,
  // força o logout automático para evitar que a sessão antiga redirecione o usuário para o dashboard indesejadamente.
  useEffect(() => {
    if (!authLoading) {
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        const hash = window.location.hash;
        if ((hash === '#auth' || hash === '#register') && user) {
          logout();
        }
      }
    }
  }, [authLoading, user, logout]);

  // Gerenciamento do Tema Escuro
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const cached = localStorage.getItem('petsanny_theme');
    if (cached === 'light' || cached === 'dark') return cached;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('petsanny_theme', theme);
  }, [theme]);

  // Sincroniza a view com o hash da URL (ex: usuário clica no botão voltar do browser)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const newView = getViewFromHash();
      setCurrentViewRaw(newView);
      if (newView === 'auth') {
        setInitialAuthMode(hash === '#register' ? 'register' : 'login');
      }
      setForceDashboard(hash === '#dashboard');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sincroniza a URL com o estado de forceDashboard
  useEffect(() => {
    if (user && !authLoading) {
      if (forceDashboard) {
        if (window.location.hash !== '#dashboard') {
          window.location.hash = '#dashboard';
        }
      } else {
        if (window.location.hash === '#dashboard') {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
    }
  }, [user, authLoading, forceDashboard]);

  // Quando o usuário faz logout, limpa hash e volta para a landing
  useEffect(() => {
    if (!user && !authLoading) {
      const hash = window.location.hash;
      if (hash === '#dashboard') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      setForceDashboard(false);
      if (hash !== '#auth' && hash !== '#register') {
        setCurrentViewRaw('landing');
      }
    }
  }, [user, authLoading]);

  // Quando user autenticado está no fluxo de login (hash #auth/#register) → redireciona definindo forceDashboard como true
  useEffect(() => {
    if (user && !authLoading && currentView === 'auth') {
      setCurrentViewRaw('landing');
      setForceDashboard(true);
    }
  }, [user, authLoading, currentView]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex items-center justify-center font-sans text-stone-900 dark:text-stone-100 transition-colors duration-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-olive-500/20 border-t-olive-600 rounded-full animate-spin" />
          <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider">{t('auth.loading')}</span>
        </div>
      </div>
    );
  }

  // Usuário autenticado, mas estava na landing page → mostra landing com botão "Ir ao Painel"
  if (user && currentView === 'landing' && !forceDashboard) {
    return (
      <LandingPage
        theme={theme}
        toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onNavigateToAuth={() => {
          // Já está logado, vai ao painel
          setForceDashboard(true);
        }}
        isLoggedIn={true}
        onGoToDashboard={() => {
          setForceDashboard(true);
        }}
      />
    );
  }

  if (!user) {
    if (currentView === 'landing') {
      return (
        <LandingPage
          theme={theme}
          toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onNavigateToAuth={(mode) => {
            setInitialAuthMode(mode);
            setCurrentView('auth', mode);
          }}
          isLoggedIn={false}
        />
      );
    }
    return (
      <Login 
        initialMode={initialAuthMode} 
        onBackToLanding={() => setCurrentView('landing')} 
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row bg-stone-50 dark:bg-stone-950 min-h-screen font-sans antialiased text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* Sidebar de Navegação Lateral */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Layout de Conteúdo: Barra Superior Mobile + Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra Superior Mobile (só aparece no mobile) */}
        <div className="flex md:hidden items-center justify-between px-6 py-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-850 shrink-0">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="Logo" className="w-8 h-8 rounded-full object-contain" />
            <span className="font-extrabold text-sm tracking-tight text-stone-900 dark:text-stone-50">PetSanny</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2.5 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-850 rounded-xl transition-all cursor-pointer border border-stone-200 dark:border-stone-800"
            title="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo Principal */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-69px)] md:h-screen p-4 sm:p-6 md:p-8 lg:p-10">
             {/* Banner de Aviso de Modo Mock de Demonstração */}
        {isMock && (
          <div className="mb-6 flex items-center gap-3 p-3.5 px-5 bg-amber-50 border border-amber-200/80 rounded-2xl shadow-sm text-xs text-amber-800 animate-pulse">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{t('demo.title')}</strong> {t('demo.desc')}
            </span>
          </div>
        )}

        {/* Topo / Header da Área de Trabalho */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <Building className="w-3.5 h-3.5" />
              <span>SaaS Dashboard</span>
              <span>•</span>
              <span className="text-stone-550 dark:text-stone-400 font-bold">{currentTenant.name}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-stone-855 dark:text-stone-100 font-sans tracking-tight flex items-center gap-2">
              {t('header.hello')}, {user.user_metadata.name || 'Gestor Sanny'}
              <Sparkles className="w-5 h-5 text-olive-500" />
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {t('header.subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Seletor de Idiomas (dropdown) */}
            <LanguageDropdown size="md" />

            {/* Botão de Tema (Sol/Lua) */}
            <button
              type="button"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-3 rounded-xl border border-stone-200 dark:border-stone-850 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-850 hover:text-stone-800 dark:hover:text-stone-100 transition-all cursor-pointer shadow-sm hover:scale-105"
              title={theme === 'light' ? t('theme.dark') : t('theme.light')}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500 animate-pulse" />}
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-olive-600 hover:bg-olive-750 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md shadow-olive-900/20 transition-all cursor-pointer hover:-translate-y-0.5 min-w-[140px]"
            >
              <Plus className="w-4 h-4" />
              {t('header.new_appointment')}
            </button>
          </div>
        </header>

        {/* Área Condicional Conforme Aba Selecionada */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Novo Dashboard Premium 2.0 */}
            <DashboardPremium />

            {/* Grid Principal do Dashboard: Agenda Simplificada + Alertas Críticos */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Agenda Inteligente de Hoje */}
              <div className="xl:col-span-2">
                <AgendaCalendar />
              </div>

              {/* Seção de Alertas Críticos */}
              <div className="xl:col-span-1">
                <CriticalAlerts />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'crm' && (
          <CRMControl />
        )}

        {activeTab === 'inventory' && (
          <InventoryAndFinance />
        )}

        {activeTab === 'automations' && (
          <AutomationsCenter />
        )}

        {activeTab === 'agenda' && (
          <div className="space-y-8">
            {/* Controle Operacional com filtros avançados e Tabela */}
            <OperationalControl onOpenAddModal={() => setIsAddModalOpen(true)} />
            
            {/* Agenda Inteligente */}
            <AgendaCalendar />
          </div>
        )}

        {activeTab === 'customers' && (
          <CustomersAndPets />
        )}

        {activeTab === 'saas' && (
          <SaaSSubscriptions />
        )}



        {activeTab === 'settings' && (
          <Settings />
        )}

      </main>
      </div>

      {/* Modal para Agendar Atendimentos */}
      <AppointmentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      {/* Assistente Virtual Inteligente Flutuante */}
      <PetSannyAI />

      {/* Container de Toasts Globais */}
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppointmentsProvider>
          <AppContent />
        </AppointmentsProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
