import React from 'react';
import logoImg from '../assets/logo.png';
import { useScrollReveal } from '../hooks/useScrollReveal';
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
  Heart
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
  // Ativa scroll-reveal em toda a landing
  const pageRef = useScrollReveal(0.12, '0px 0px -50px 0px');

  return (
    <div ref={pageRef} className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-850 dark:text-stone-100 transition-colors duration-300 font-sans selection:bg-olive-500 selection:text-white">
      
      {/* ─────────────── 1. NAVBAR ─────────────── */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-stone-955/75 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-900 transition-colors duration-200 animate-fade-in-down">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img 
              src={logoImg} 
              alt="PetSanny Logo" 
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow animate-float" 
            />
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-stone-850 dark:text-stone-50 bg-gradient-to-r from-stone-850 to-stone-700 dark:from-stone-50 dark:to-stone-300 bg-clip-text text-transparent">
              PetSanny
            </span>
          </div>

          {/* Links e Controles */}
          <div className="flex items-center gap-3 sm:gap-6">
            <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-stone-550 dark:text-stone-400">
              <a href="#features" className="nav-link hover:text-olive-650 dark:hover:text-olive-400 transition-colors">Recursos</a>
              <a href="#workflow" className="nav-link hover:text-olive-650 dark:hover:text-olive-400 transition-colors">Como Funciona</a>
              <a href="#pricing" className="nav-link hover:text-olive-650 dark:hover:text-olive-400 transition-colors">Preço</a>
            </nav>

            <div className="h-4 w-px bg-stone-200 dark:bg-stone-800 hidden md:block" />

            {/* Alternar Tema */}
            <button
              onClick={toggleTheme}
              className="p-2 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-xl transition-all cursor-pointer hover:scale-110 active:scale-95"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-stone-600" />}
            </button>

            {/* Botões de Ação */}
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
                  className="btn-cta-secondary hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-650 dark:text-stone-300 hover:text-stone-850 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Entrar
                </button>
                <button
                  onClick={() => onNavigateToAuth('register')}
                  className="btn-cta-primary flex items-center gap-1.5 px-4 py-2 bg-olive-600 dark:bg-olive-600 text-white text-xs font-bold rounded-xl shadow-md shadow-olive-900/10 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Cadastrar Clínica
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─────────────── 2. HERO SECTION ─────────────── */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 overflow-hidden">
        {/* Orbs decorativos com morfologia animada */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-olive-500/10 dark:bg-olive-500/5 blur-[100px] pointer-events-none morph-orb" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-emerald-500/5 blur-[80px] pointer-events-none morph-orb" style={{ animationDelay: '2s' }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Textos Persuasivos — slide da esquerda */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="animate-fade-in-up inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-olive-500/10 text-olive-650 dark:text-olive-400 text-[10px] sm:text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Gestão PetCare Inteligente
            </div>

            <h1 className="animate-fade-in-up delay-100 text-3xl sm:text-5xl font-black tracking-tight leading-[1.1] text-stone-900 dark:text-stone-50">
              O ecossistema completo para gerenciar seu{' '}
              <span className="bg-gradient-to-r from-olive-600 to-emerald-600 dark:from-olive-400 dark:to-emerald-555 bg-clip-text text-transparent">
                Petshop ou Clínica
              </span>
            </h1>

            <p className="animate-fade-in-up delay-200 text-sm sm:text-base text-stone-550 dark:text-stone-400 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              Unifique agendamentos automáticos, fichas de clientes e histórico de pets com segurança e performance. Esqueça planilhas confusas e erros de horários com nossa plataforma inteligente projetada especificamente para veterinários e profissionais de estética pet.
            </p>

            {/* CTAs */}
            <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={() => onNavigateToAuth('register')}
                className="btn-cta-primary w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-olive-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-olive-900/15 cursor-pointer"
              >
                Experimentar 14 Dias Grátis
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#features"
                className="btn-cta-secondary w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 border border-stone-250 dark:border-stone-850 hover:bg-stone-100 dark:hover:bg-stone-900 font-bold text-sm rounded-2xl cursor-pointer text-stone-600 dark:text-stone-300"
              >
                Conhecer Recursos
              </a>
            </div>

            {/* Micro Benefícios com stagger */}
            <div className="animate-fade-in-up delay-400 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-[10px] sm:text-xs font-bold text-stone-450 dark:text-stone-500 pt-4">
              {[
                'Sem cartão de crédito no teste',
                'Dados seguros e privados',
                'Configuração em 2 minutos',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {benefit}
                </div>
              ))}
            </div>
          </div>

          {/* Mockup Interativo — slide da direita */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0 flex justify-center animate-slide-right delay-200">
            <div className="animate-float relative w-full max-w-[360px] aspect-[4/3] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl p-4 flex flex-col justify-between overflow-hidden select-none">
              {/* Header do Mockup */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800/80">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="h-3.5 w-24 bg-stone-100 dark:bg-stone-800 rounded-full" />
              </div>

              {/* Cards Internos Simulados */}
              <div className="flex-1 py-4 space-y-3.5">
                {/* Metric Card */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-stone-50 dark:bg-stone-955 rounded-2xl border border-stone-150 dark:border-stone-800/60 flex flex-col justify-between">
                    <span className="text-[7.5px] uppercase font-bold text-stone-400">Total Faturamento</span>
                    <span className="text-xs font-black text-stone-800 dark:text-stone-100 mt-1">R$ 12.450,00</span>
                  </div>
                  <div className="p-2.5 bg-olive-500/5 dark:bg-olive-950/10 rounded-2xl border border-olive-500/10 flex flex-col justify-between">
                    <span className="text-[7.5px] uppercase font-bold text-olive-600 dark:text-olive-400">Agendados Hoje</span>
                    <span className="text-xs font-black text-olive-750 dark:text-olive-350 mt-1">8 Pets</span>
                  </div>
                </div>

                {/* Appointment Row */}
                <div className="space-y-1.5">
                  <span className="text-[7.5px] uppercase font-bold text-stone-400">Próximos Atendimentos</span>
                  <div className="p-2.5 bg-stone-50 dark:bg-stone-955 rounded-xl border border-stone-150 dark:border-stone-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-olive-500/10 text-olive-650 flex items-center justify-center text-[10px] font-black">
                        🐶
                      </div>
                      <div>
                        <h6 className="text-[9px] font-black text-stone-800 dark:text-stone-200">Mel (Golden Retriever)</h6>
                        <span className="text-[7.5px] text-stone-400 font-medium">Banho &amp; Tosa H. • Ed Gama</span>
                      </div>
                    </div>
                    <span className="text-[7.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      Confirmado
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800/80 text-[7px] text-stone-400 dark:text-stone-500 font-bold">
                <span>Ao Vivo • PetSanny Dashboard</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── 3. FEATURES SECTION ─────────────── */}
      <section id="features" className="py-20 sm:py-28 bg-white dark:bg-stone-900 border-y border-stone-200/80 dark:border-stone-800/70 relative transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header da Seção */}
          <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
            <span className="reveal-up text-[9px] sm:text-xs font-black uppercase text-olive-600 dark:text-olive-400 tracking-wider block">
              Recursos de Alta Performance
            </span>
            <h2 className="reveal-up stagger-1 text-2xl sm:text-4xl font-black text-stone-900 dark:text-stone-50 leading-tight">
              Tudo o que sua clínica precisa em um único lugar
            </h2>
            <p className="reveal-up stagger-2 text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-semibold">
              Desenvolvemos uma ferramenta focada em usabilidade e agilidade operacional. Menos cliques para realizar as tarefas e mais tempo para cuidar dos pets.
            </p>
          </div>

          {/* Grid de Features com stagger */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Feature 1 */}
            <div className="reveal-up stagger-1 feature-card-hover p-6 rounded-3xl bg-stone-50 dark:bg-stone-955 border border-stone-200/60 dark:border-stone-800/80 hover:border-olive-500/40 dark:hover:border-olive-500/30 group">
              <div className="feature-icon-spring w-10 h-10 rounded-2xl bg-olive-500/10 dark:bg-olive-950/30 text-olive-650 dark:text-olive-400 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-stone-850 dark:text-stone-100 group-hover:text-olive-650 dark:group-hover:text-olive-450 transition-colors">
                Agenda Inteligente
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mt-2 font-medium">
                Visualize e agende serviços por categorias e profissionais com calendários coloridos e filtros instantâneos. Alertas automáticos garantem que você nunca marque conflitos de horários.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="reveal-up stagger-2 feature-card-hover p-6 rounded-3xl bg-stone-50 dark:bg-stone-955 border border-stone-200/60 dark:border-stone-800/80 hover:border-olive-500/40 dark:hover:border-olive-500/30 group">
              <div className="feature-icon-spring w-10 h-10 rounded-2xl bg-olive-500/10 dark:bg-olive-950/30 text-olive-650 dark:text-olive-400 flex items-center justify-center mb-4">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-stone-850 dark:text-stone-100 group-hover:text-olive-650 dark:group-hover:text-olive-450 transition-colors">
                Histórico Completo do Pet
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mt-2 font-medium">
                Mantenha o prontuário atualizado de cada animal: vacinas, serviços realizados, observações clínicas e data de nascimento. Tudo num só lugar para um atendimento mais humano e personalizado.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="reveal-up stagger-3 feature-card-hover p-6 rounded-3xl bg-stone-50 dark:bg-stone-955 border border-stone-200/60 dark:border-stone-800/80 hover:border-olive-500/40 dark:hover:border-olive-500/30 group">
              <div className="feature-icon-spring w-10 h-10 rounded-2xl bg-olive-500/10 dark:bg-olive-950/30 text-olive-650 dark:text-olive-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-stone-850 dark:text-stone-100 group-hover:text-olive-650 dark:group-hover:text-olive-450 transition-colors">
                Controle Operacional &amp; SaaS
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mt-2 font-medium">
                Acompanhe o status de atendimentos de ponta a ponta. Altere status para confirmado, pendente ou concluído, gerando gatilhos e controlando cobranças de forma integrada e descomplicada.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────── 4. WORKFLOW SECTION ─────────────── */}
      <section id="workflow" className="py-20 sm:py-28 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
            <span className="reveal-up text-[9px] sm:text-xs font-black uppercase text-olive-600 dark:text-olive-400 tracking-wider block">
              Simples e Prático
            </span>
            <h2 className="reveal-up stagger-1 text-2xl sm:text-4xl font-black text-stone-900 dark:text-stone-50 leading-tight">
              Sua clínica rodando em 3 passos simples
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Linha conectora (decorativa, só desktop) */}
            <div className="hidden md:block absolute top-7 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-olive-400/30 to-transparent pointer-events-none" />

            {[
              {
                n: 1,
                title: 'Registre sua clínica',
                desc: 'Cadastre o nome corporativo da sua clínica, proprietário e localização no formulário simplificado.',
                reveal: 'reveal-up stagger-1',
              },
              {
                n: 2,
                title: 'Cadastre clientes e pets',
                desc: 'Registre tutores com contatos e seus respectivos pets especificando a espécie e raça (com suporte a customizadas).',
                reveal: 'reveal-up stagger-2',
              },
              {
                n: 3,
                title: 'Organize os agendamentos',
                desc: 'Abra agendamentos em um clique, atualize o status da operação e envie alertas automáticos de cobrança.',
                reveal: 'reveal-up stagger-3',
              },
            ].map(({ n, title, desc, reveal }) => (
              <div key={n} className={`${reveal} text-center space-y-3 relative group`}>
                <div className="w-14 h-14 mx-auto rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow flex items-center justify-center text-lg font-black text-olive-600 dark:text-olive-400 transition-all duration-300 group-hover:bg-olive-500 group-hover:text-white group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-olive-500/20">
                  {n}
                </div>
                <h4 className="font-extrabold text-sm text-stone-850 dark:text-stone-100">{title}</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-[240px] mx-auto font-medium">{desc}</p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ─────────────── 5. PRICING SECTION ─────────────── */}
      <section id="pricing" className="py-20 sm:py-28 bg-stone-100 dark:bg-stone-900/60 border-t border-stone-250/70 dark:border-stone-900 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-12">
            <span className="reveal-up text-[9px] sm:text-xs font-black uppercase text-olive-600 dark:text-olive-400 tracking-wider block">
              Plano de Assinatura Único
            </span>
            <h2 className="reveal-up stagger-1 text-2xl sm:text-4xl font-black text-stone-900 dark:text-stone-50 leading-tight">
              Preço transparente, sem pegadinhas ou custos ocultos
            </h2>
          </div>

          <div className="max-w-md mx-auto relative mt-6 reveal-scale">
            {/* Glow atrás do card */}
            <div className="absolute inset-0 bg-olive-550/20 rounded-3xl blur-2xl -translate-y-4 scale-95 opacity-50 dark:opacity-35 pointer-events-none" />

            <div className="relative bg-white dark:bg-stone-955 border border-stone-250 dark:border-stone-800 shadow-xl rounded-3xl p-8 flex flex-col justify-between space-y-6 text-center">
              
              <div className="space-y-2">
                <span className="px-3 py-1 bg-olive-500/10 text-olive-650 dark:text-olive-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                  Plano Corporativo Completo
                </span>
                <h3 className="font-extrabold text-lg text-stone-850 dark:text-stone-100 pt-2">Acesso Ilimitado</h3>
                <p className="text-xs text-stone-450 dark:text-stone-500 font-semibold">Indicado para petshops, clínicas e profissionais independentes.</p>
              </div>

              {/* Preço com shimmer */}
              <div className="py-4 border-y border-stone-150 dark:border-stone-850 flex flex-col items-center">
                <span className="text-[10px] font-bold text-stone-450 dark:text-stone-500 uppercase tracking-wider">Valor Mensal</span>
                <div className="flex items-baseline mt-1">
                  <span className="text-base font-bold text-stone-450 mr-1">R$</span>
                  <span className="text-4xl font-black text-stone-900 dark:text-stone-50 leading-none font-mono price-shimmer">97,00</span>
                  <span className="text-xs text-stone-450 dark:text-stone-500 ml-1.5">/mês</span>
                </div>
                <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-500 mt-2 block uppercase tracking-wider">
                  Teste grátis por 14 dias
                </span>
              </div>

              {/* Benefícios com stagger inline */}
              <ul className="text-left space-y-3.5 text-xs text-stone-600 dark:text-stone-300 font-semibold">
                {[
                  'Agendamentos e serviços ilimitados',
                  'Cadastro ilimitado de tutores e pets',
                  'Acesso ao dashboard de métricas em tempo real',
                  'Histórico e prontuário completo de cada pet',
                  'Suporte dedicado por e-mail e WhatsApp',
                ].map((benefit, i) => (
                  <li
                    key={benefit}
                    className="flex items-center gap-2.5"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>

              {/* CTA do Plano */}
              <button
                onClick={() => onNavigateToAuth('register')}
                className="btn-cta-primary w-full py-4 bg-olive-650 text-white font-black text-sm rounded-2xl shadow-md shadow-olive-900/10 cursor-pointer"
              >
                Criar Minha Conta e Testar Grátis
              </button>

              <span className="text-[9px] text-stone-400 dark:text-stone-500 font-extrabold uppercase tracking-wider">
                Cancele quando quiser • Sem fidelidade ou taxas de ativação
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── 6. CTA FINAL ─────────────── */}
      <section className="py-20 sm:py-28 relative overflow-hidden bg-white dark:bg-stone-950 border-t border-stone-200/80 dark:border-stone-900 transition-colors duration-200">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-olive-500/6 blur-[90px] pointer-events-none morph-orb" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
          <h2 className="reveal-up text-2xl sm:text-4xl font-black text-stone-900 dark:text-stone-50 tracking-tight">
            Pronto para revolucionar a gestão da sua clínica?
          </h2>
          <p className="reveal-up stagger-1 text-xs sm:text-sm text-stone-550 dark:text-stone-450 leading-relaxed max-w-xl mx-auto font-semibold">
            Junte-se a dezenas de clínicas que já modernizaram suas operações, reduziram faltas de clientes e otimizaram faturamentos com o ecossistema do PetSanny.
          </p>
          <div className="reveal-up stagger-2 pt-2">
            <button
              onClick={() => onNavigateToAuth('register')}
              className="btn-cta-primary px-8 py-4 bg-olive-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-olive-900/15 cursor-pointer inline-flex items-center gap-2"
            >
              Criar Clínica Agora
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────── 7. FOOTER ─────────────── */}
      <footer className="bg-stone-50 dark:bg-stone-955 border-t border-stone-200/60 dark:border-stone-900/60 py-8 text-center text-[10px] sm:text-xs text-stone-450 dark:text-stone-550 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="Logo" className="w-5 h-5 object-contain" />
            <span className="font-extrabold tracking-tight text-stone-750 dark:text-stone-400">PetSanny © 2026</span>
          </div>
          <p className="font-bold">Gestão PetCare Inteligente • Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  );
};
