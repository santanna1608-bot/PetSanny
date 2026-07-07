import { useState, useEffect } from 'react';
import { AppointmentsProvider, useAppointments } from './contexts/AppointmentsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Login } from './components/Login';
import { CustomersAndPets } from './components/CustomersAndPets';
import { Sidebar } from './components/Sidebar';
import { DashboardMetrics } from './components/DashboardMetrics';
import { AgendaCalendar } from './components/AgendaCalendar';
import { OperationalControl } from './components/OperationalControl';
import { CriticalAlerts } from './components/CriticalAlerts';
import { AppointmentModal } from './components/AppointmentModal';
import { ToastContainer } from './components/ToastContainer';
import { SaaSSubscriptions } from './components/SaaSSubscriptions';
import { Settings } from './components/Settings';
import { 
  Plus, 
  Sparkles,
  Building,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { currentTenant, isMock } = useAppointments();
  const { user, loading: authLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();

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

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex bg-stone-50 dark:bg-stone-950 min-h-screen font-sans antialiased text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* Sidebar de Navegação Lateral */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto h-screen p-8 lg:p-10">
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

          <div className="flex items-center gap-3">
            {/* Seletor Compacto de Idiomas */}
            <div className="flex items-center border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-900 p-1 shadow-sm gap-0.5">
              {(['pt', 'en', 'es'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-1.5 rounded-lg text-[9px] font-extrabold uppercase transition-all cursor-pointer ${
                    language === lang
                      ? 'bg-olive-600 text-white shadow-sm'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-750 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-850'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

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
              className="flex items-center gap-1.5 bg-olive-600 hover:bg-olive-750 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md shadow-olive-900/20 transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              {t('header.new_appointment')}
            </button>
          </div>
        </header>

        {/* Área Condicional Conforme Aba Selecionada */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Cards de Métricas */}
            <DashboardMetrics />

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

      {/* Modal para Agendar Atendimentos */}
      <AppointmentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

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
