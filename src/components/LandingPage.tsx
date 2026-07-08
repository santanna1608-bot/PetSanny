import React, { useState } from 'react';
import logoImg from '../assets/logo.png';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  ArrowRight,
  Sun,
  Moon,
  UserPlus,
  LogIn,
  CheckCircle2,
  Heart,
  Menu,
  X
} from 'lucide-react';

interface LandingPageProps {
  onNavigateToAuth: (mode: 'login' | 'register') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isLoggedIn?: boolean;
  onGoToDashboard?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onNavigateToAuth, 
  theme, 
  toggleTheme,
  isLoggedIn = false,
  onGoToDashboard
}) => {
  const pageRef = useScrollReveal(0.12, '0px 0px -50px 0px');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div ref={pageRef} className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-300 font-sans selection:bg-olive-500 selection:text-white">
      
      {/* ─────────────── 1. NAVBAR ─────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-stone-955/85 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-900 transition-colors duration-200 animate-fade-in-down">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <img 
              src={logoImg} 
              alt="PetSanny Logo" 
              className="w-7 h-7 object-contain drop-shadow animate-float rounded-full" 
            />
            <span className="font-extrabold text-base tracking-tight text-stone-900 dark:text-stone-50">
              PetSanny
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-stone-500 dark:text-stone-400">
            <a href="#features" className="nav-link hover:text-olive-650 dark:hover:text-olive-400 transition-colors">Recursos</a>
            <a href="#workflow" className="nav-link hover:text-olive-650 dark:hover:text-olive-400 transition-colors">Como Funciona</a>
            <a href="#pricing" className="nav-link hover:text-olive-650 dark:hover:text-olive-400 transition-colors">Preço</a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Seletor de Idiomas */}
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

            <button
              onClick={toggleTheme}
              className="p-2 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-xl transition-all cursor-pointer hover:scale-110 active:scale-95"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-stone-600" />}
            </button>

            {isLoggedIn ? (
              <button
                onClick={onGoToDashboard}
                className="btn-cta-primary flex items-center gap-1.5 px-4 py-2 bg-olive-600 text-white text-xs font-bold rounded-xl shadow-md shadow-olive-900/10 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                Ir ao Painel
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigateToAuth('login')}
                  className="btn-cta-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Entrar
                </button>
                <button
                  onClick={() => onNavigateToAuth('register')}
                  className="btn-cta-primary flex items-center gap-1.5 px-4 py-2 bg-olive-600 text-white text-xs font-bold rounded-xl shadow-md shadow-olive-900/10 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Cadastrar
                </button>
              </>
            )}
          </div>

          {/* Mobile: tema + hambúrguer */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-xl transition-all cursor-pointer"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-stone-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-xl transition-all cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu — drawer */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <div className="px-4 pb-4 pt-2 flex flex-col gap-3 border-t border-stone-100 dark:border-stone-900">
            <nav className="flex flex-col gap-1">
              {[
                { href: '#features', label: 'Recursos' },
                { href: '#workflow', label: 'Como Funciona' },
                { href: '#pricing', label: 'Preço' },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={closeMobileMenu}
                  className="px-3 py-2.5 text-sm font-bold text-stone-600 dark:text-stone-300 hover:text-olive-650 dark:hover:text-olive-400 hover:bg-stone-50 dark:hover:bg-stone-900 rounded-xl transition-all"
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="flex flex-col gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              {/* Seletor de Idiomas no Mobile */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider">Idioma</span>
                <div className="flex items-center border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-900 p-1 gap-0.5">
                  {(['pt', 'en', 'es'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLanguage(lang)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                        language === lang
                          ? 'bg-olive-600 text-white shadow-sm'
                          : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-850'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
              {isLoggedIn ? (
                <button
                  onClick={() => { closeMobileMenu(); onGoToDashboard?.(); }}
                  className="btn-cta-primary w-full flex items-center justify-center gap-2 py-3 bg-olive-600 text-white text-sm font-bold rounded-xl cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  Ir ao Painel
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { closeMobileMenu(); onNavigateToAuth('login'); }}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-stone-200 dark:border-stone-800 text-sm font-bold text-stone-600 dark:text-stone-300 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-900 transition-all cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    Entrar na Conta
                  </button>
                  <button
                    onClick={() => { closeMobileMenu(); onNavigateToAuth('register'); }}
                    className="btn-cta-primary w-full flex items-center justify-center gap-2 py-3 bg-olive-600 text-white text-sm font-bold rounded-xl cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    Cadastrar Clínica Grátis
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────── 2. HERO SECTION ─────────────── */}
      <section className="relative pt-10 pb-16 sm:pt-20 sm:pb-32 overflow-hidden">
        {/* Orbs decorativos */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-olive-500/10 dark:bg-olive-500/5 blur-[80px] sm:blur-[100px] pointer-events-none morph-orb" />
        <div className="absolute top-1/3 left-1/3 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] bg-emerald-500/5 blur-[60px] sm:blur-[80px] pointer-events-none morph-orb" style={{ animationDelay: '2s' }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
          {/* Textos Persuasivos */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="animate-fade-in-up inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-olive-500/10 text-olive-700 dark:text-olive-400 text-[10px] sm:text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              Gestão PetCare Inteligente
            </div>

            <h1 className="animate-fade-in-up delay-100 text-[2rem] sm:text-5xl font-black tracking-tight leading-[1.1] text-stone-900 dark:text-stone-50">
              O ecossistema completo para gerenciar seu{' '}
              <span className="bg-gradient-to-r from-olive-600 to-emerald-600 dark:from-olive-400 dark:to-emerald-500 bg-clip-text text-transparent">
                Petshop ou Clínica
              </span>
            </h1>

            <p className="animate-fade-in-up delay-200 text-sm sm:text-base text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              Unifique agendamentos, fichas de clientes e histórico de pets em uma plataforma inteligente. Esqueça planilhas confusas — gerencie tudo com agilidade e segurança.
            </p>

            {/* CTAs */}
            <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-1">
              <button
                onClick={() => onNavigateToAuth('register')}
                className="btn-cta-primary flex items-center justify-center gap-2 px-6 py-3.5 bg-olive-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-olive-900/15 cursor-pointer"
              >
                Experimentar 14 Dias Grátis
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
              <a
                href="#features"
                className="btn-cta-secondary flex items-center justify-center gap-2 px-6 py-3.5 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-900 font-bold text-sm rounded-2xl cursor-pointer text-stone-600 dark:text-stone-300"
              >
                Conhecer Recursos
              </a>
            </div>

            {/* Micro Benefícios */}
            <div className="animate-fade-in-up delay-400 flex flex-col xs:flex-row flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-[10px] sm:text-xs font-bold text-stone-400 dark:text-stone-500 pt-2">
              {[
                'Sem cartão de crédito',
                'Dados seguros',
                'Configuração em 2 min',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-1.5 whitespace-nowrap">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {benefit}
                </div>
              ))}
            </div>
          </div>

          {/* Mockup Interativo */}
          <div className="lg:col-span-5 relative flex justify-center animate-slide-right delay-200">
            <div className="animate-float relative w-full max-w-[340px] sm:max-w-[380px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl p-4 flex flex-col gap-3 select-none">
              {/* Header do Mockup */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="h-3 w-20 bg-stone-100 dark:bg-stone-800 rounded-full" />
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-100 dark:border-stone-800 flex flex-col gap-1">
                  <span className="text-[7px] uppercase font-bold text-stone-400">Total Faturamento</span>
                  <span className="text-xs font-black text-stone-800 dark:text-stone-100">R$ 12.450,00</span>
                </div>
                <div className="p-2.5 bg-olive-500/5 dark:bg-olive-950/10 rounded-2xl border border-olive-500/10 flex flex-col gap-1">
                  <span className="text-[7px] uppercase font-bold text-olive-600 dark:text-olive-400">Agendados Hoje</span>
                  <span className="text-xs font-black text-olive-700 dark:text-olive-400">8 Pets</span>
                </div>
              </div>

              {/* Appointment Row */}
              <div className="space-y-1.5">
                <span className="text-[7px] uppercase font-bold text-stone-400">Próximos Atendimentos</span>
                <div className="p-2.5 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded bg-olive-500/10 flex items-center justify-center text-[11px] shrink-0">
                      🐶
                    </div>
                    <div className="min-w-0">
                      <h6 className="text-[8px] font-black text-stone-800 dark:text-stone-200 truncate">Mel (Golden Retriever)</h6>
                      <span className="text-[7px] text-stone-400 font-medium">Banho &amp; Tosa • Ed Gama</span>
                    </div>
                  </div>
                  <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
                    ✓ OK
                  </span>
                </div>
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-[7px] text-stone-400 font-bold">
                <span>Ao Vivo • PetSanny Dashboard</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── 3. FEATURES SECTION ─────────────── */}
      <section id="features" className="py-16 sm:py-28 bg-white dark:bg-stone-900 border-y border-stone-200/80 dark:border-stone-800/70 relative transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-12 sm:mb-16">
            <span className="reveal-up text-[9px] sm:text-xs font-black uppercase text-olive-600 dark:text-olive-400 tracking-wider block">
              Recursos de Alta Performance
            </span>
            <h2 className="reveal-up stagger-1 text-2xl sm:text-4xl font-black text-stone-900 dark:text-stone-50 leading-tight">
              Tudo o que sua clínica precisa em um único lugar
            </h2>
            <p className="reveal-up stagger-2 text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-semibold">
              Menos cliques para realizar as tarefas e mais tempo para cuidar dos pets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {[
              {
                icon: <Calendar className="w-5 h-5" />,
                title: 'Agenda Inteligente',
                desc: 'Visualize e agende serviços com calendários coloridos e filtros instantâneos. Alertas automáticos evitam conflitos de horários.',
                stagger: 'stagger-1',
              },
              {
                icon: <Heart className="w-5 h-5" />,
                title: 'Histórico Completo do Pet',
                desc: 'Prontuário atualizado de cada animal: vacinas, serviços e data de nascimento. Um atendimento mais humano e personalizado.',
                stagger: 'stagger-2',
              },
              {
                icon: <TrendingUp className="w-5 h-5" />,
                title: 'Controle Operacional',
                desc: 'Status de atendimentos de ponta a ponta. Confirme, penda ou conclua cada serviço com cobranças integradas.',
                stagger: 'stagger-3',
              },
            ].map(({ icon, title, desc, stagger }) => (
              <div
                key={title}
                className={`reveal-up ${stagger} feature-card-hover p-6 rounded-3xl bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-800/80 hover:border-olive-500/40 dark:hover:border-olive-500/30 group sm:col-span-1`}
              >
                <div className="feature-icon-spring w-10 h-10 rounded-2xl bg-olive-500/10 dark:bg-olive-900/30 text-olive-700 dark:text-olive-400 flex items-center justify-center mb-4">
                  {icon}
                </div>
                <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100 group-hover:text-olive-700 dark:group-hover:text-olive-400 transition-colors">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed mt-2 font-medium">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── 4. WORKFLOW SECTION ─────────────── */}
      <section id="workflow" className="py-16 sm:py-28 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-12 sm:mb-16">
            <span className="reveal-up text-[9px] sm:text-xs font-black uppercase text-olive-600 dark:text-olive-400 tracking-wider block">
              Simples e Prático
            </span>
            <h2 className="reveal-up stagger-1 text-2xl sm:text-4xl font-black text-stone-900 dark:text-stone-50 leading-tight">
              Sua clínica rodando em 3 passos simples
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 relative">
            {/* Linha conectora visual (só desktop) */}
            <div
              className="hidden sm:block absolute top-7 h-px pointer-events-none"
              style={{
                left: 'calc(16.666% + 28px)',
                right: 'calc(16.666% + 28px)',
                background: 'linear-gradient(to right, transparent, rgba(104,142,79,0.25), transparent)',
              }}
            />

            {[
              {
                n: 1,
                title: 'Registre sua clínica',
                desc: 'Cadastre o nome da sua clínica, proprietário e localização no formulário simplificado.',
              },
              {
                n: 2,
                title: 'Cadastre clientes e pets',
                desc: 'Registre tutores com contatos e seus pets especificando espécie e raça.',
              },
              {
                n: 3,
                title: 'Organize os agendamentos',
                desc: 'Abra agendamentos em um clique, atualize o status e envie alertas automáticos.',
              },
            ].map(({ n, title, desc }, i) => (
              <div
                key={n}
                className={`reveal-up stagger-${i + 1} flex flex-col sm:text-center items-start sm:items-center gap-3 sm:gap-4 group`}
              >
                {/* Linha mobile conectora vertical */}
                <div className="sm:hidden flex items-start gap-4 w-full">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow flex items-center justify-center text-base font-black text-olive-600 dark:text-olive-400 transition-all duration-300 group-hover:bg-olive-500 group-hover:text-white group-hover:scale-105">
                      {n}
                    </div>
                    {n < 3 && <div className="w-px flex-1 min-h-[40px] bg-stone-200 dark:bg-stone-800 mt-2" />}
                  </div>
                  <div className="pt-2 pb-4">
                    <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 mb-1">{title}</h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">{desc}</p>
                  </div>
                </div>
                {/* Desktop layout */}
                <div className="hidden sm:flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow flex items-center justify-center text-lg font-black text-olive-600 dark:text-olive-400 transition-all duration-300 group-hover:bg-olive-500 group-hover:text-white group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-olive-500/20">
                    {n}
                  </div>
                  <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100">{title}</h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-[220px] font-medium">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── 5. PRICING SECTION ─────────────── */}
      <section id="pricing" className="py-16 sm:py-28 bg-stone-100 dark:bg-stone-900/60 border-t border-stone-200 dark:border-stone-900 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-10 sm:mb-12">
            <span className="reveal-up text-[9px] sm:text-xs font-black uppercase text-olive-600 dark:text-olive-400 tracking-wider block">
              Plano de Assinatura Único
            </span>
            <h2 className="reveal-up stagger-1 text-2xl sm:text-4xl font-black text-stone-900 dark:text-stone-50 leading-tight">
              Preço transparente, sem pegadinhas
            </h2>
          </div>

          <div className="max-w-sm mx-auto relative mt-6 reveal-scale px-0">
            {/* Glow */}
            <div className="absolute inset-0 bg-olive-500/15 rounded-3xl blur-2xl -translate-y-3 scale-95 opacity-60 dark:opacity-30 pointer-events-none" />

            <div className="relative bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 shadow-xl rounded-3xl p-6 sm:p-8 flex flex-col gap-6 text-center">
              <div className="space-y-2">
                <span className="px-3 py-1 bg-olive-500/10 text-olive-700 dark:text-olive-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-full">
                  Plano Corporativo Completo
                </span>
                <h3 className="font-extrabold text-lg text-stone-900 dark:text-stone-100 pt-1">Acesso Ilimitado</h3>
                <p className="text-xs text-stone-400 dark:text-stone-500 font-semibold">Para petshops, clínicas e profissionais independentes.</p>
              </div>

              <div className="py-4 border-y border-stone-100 dark:border-stone-800 flex flex-col items-center">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Valor Mensal</span>
                <div className="flex items-baseline mt-1.5">
                  <span className="text-base font-bold text-stone-400 mr-1">R$</span>
                  <span className="text-5xl font-black text-stone-900 dark:text-stone-50 leading-none font-mono price-shimmer">97,00</span>
                  <span className="text-xs text-stone-400 ml-1.5">/mês</span>
                </div>
                <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-500 mt-2 uppercase tracking-wider">
                  Teste grátis por 14 dias
                </span>
              </div>

              <ul className="text-left space-y-3 text-sm text-stone-600 dark:text-stone-300 font-semibold">
                {[
                  'Agendamentos e serviços ilimitados',
                  'Cadastro ilimitado de tutores e pets',
                  'Dashboard de métricas em tempo real',
                  'Histórico e prontuário completo de cada pet',
                  'Suporte por e-mail e WhatsApp',
                ].map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onNavigateToAuth('register')}
                className="btn-cta-primary w-full py-4 bg-olive-600 text-white font-black text-sm rounded-2xl shadow-md shadow-olive-900/15 cursor-pointer"
              >
                Criar Minha Conta e Testar Grátis
              </button>

              <span className="text-[9px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider">
                Cancele quando quiser • Sem fidelidade
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── 6. CTA FINAL ─────────────── */}
      <section className="py-16 sm:py-28 relative overflow-hidden bg-white dark:bg-stone-950 border-t border-stone-200/80 dark:border-stone-900 transition-colors duration-200">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] bg-olive-500/6 blur-[80px] pointer-events-none morph-orb" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-5">
          <h2 className="reveal-up text-2xl sm:text-4xl font-black text-stone-900 dark:text-stone-50 tracking-tight">
            Pronto para revolucionar a gestão da sua clínica?
          </h2>
          <p className="reveal-up stagger-1 text-sm text-stone-500 dark:text-stone-400 leading-relaxed max-w-lg mx-auto font-semibold">
            Junte-se a dezenas de clínicas que já modernizaram suas operações com o PetSanny.
          </p>
          <div className="reveal-up stagger-2 pt-2">
            <button
              onClick={() => onNavigateToAuth('register')}
              className="btn-cta-primary w-full sm:w-auto px-8 py-4 bg-olive-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-olive-900/15 cursor-pointer inline-flex items-center justify-center gap-2"
            >
              Criar Clínica Agora
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────── 7. FOOTER ─────────────── */}
      <footer className="bg-stone-50 dark:bg-stone-950 border-t border-stone-200/60 dark:border-stone-900/60 py-6 sm:py-8 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="Logo" className="w-5 h-5 object-contain rounded-full" />
            <span className="font-extrabold tracking-tight text-xs text-stone-700 dark:text-stone-400">PetSanny © 2026</span>
          </div>
          <p className="text-[10px] sm:text-xs font-bold text-stone-400 dark:text-stone-500">
            Gestão PetCare Inteligente • Todos os direitos reservados.
          </p>
        </div>
      </footer>

    </div>
  );
};
