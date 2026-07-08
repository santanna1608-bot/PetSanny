import React from 'react';
import logoImg from '../assets/logo.png';
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
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onNavigateToAuth, 
  theme, 
  toggleTheme 
}) => {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-850 dark:text-stone-100 transition-colors duration-300 font-sans selection:bg-olive-500 selection:text-white">
      
      {/* 1. NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-stone-955/75 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-900 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img 
              src={logoImg} 
              alt="PetSanny Logo" 
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow" 
            />
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-stone-850 dark:text-stone-50 bg-gradient-to-r from-stone-850 to-stone-700 dark:from-stone-50 dark:to-stone-300 bg-clip-text text-transparent">
              PetSanny
            </span>
          </div>

          {/* Links e Controles */}
          <div className="flex items-center gap-3 sm:gap-6">
            <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-stone-550 dark:text-stone-400">
              <a href="#features" className="hover:text-olive-650 dark:hover:text-olive-400 transition-colors">Recursos</a>
              <a href="#workflow" className="hover:text-olive-650 dark:hover:text-olive-400 transition-colors">Como Funciona</a>
              <a href="#pricing" className="hover:text-olive-650 dark:hover:text-olive-400 transition-colors">Preço</a>
            </nav>

            <div className="h-4 w-px bg-stone-200 dark:bg-stone-800 hidden md:block" />

            {/* Alternar Tema */}
            <button
              onClick={toggleTheme}
              className="p-2 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-xl transition-all cursor-pointer"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-stone-600" />}
            </button>

            {/* Botões de Ação */}
            <button
              onClick={() => onNavigateToAuth('login')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-650 dark:text-stone-300 hover:text-stone-850 dark:hover:text-white transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              Entrar
            </button>
            <button
              onClick={() => onNavigateToAuth('register')}
              className="flex items-center gap-1.5 px-4 py-2 bg-olive-600 hover:bg-olive-750 dark:bg-olive-600 dark:hover:bg-olive-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-olive-900/10 hover:shadow-lg cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Cadastrar Clínica
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 overflow-hidden">
        {/* Efeitos Decorativos de Fundo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-olive-500/10 dark:bg-olive-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-orange-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Textos Persuasivos */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-olive-500/10 text-olive-650 dark:text-olive-400 text-[10px] sm:text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Gestão PetCare Inteligente
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1] text-stone-900 dark:text-stone-50">
              O ecossistema completo para gerenciar seu{' '}
              <span className="bg-gradient-to-r from-olive-600 to-emerald-600 dark:from-olive-400 dark:to-emerald-555 bg-clip-text text-transparent">
                Petshop ou Clínica
              </span>
            </h1>

            <p className="text-sm sm:text-base text-stone-550 dark:text-stone-400 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              Unifique agendamentos automáticos, fichas de clientes e histórico de pets com segurança e performance. Esqueça planilhas confusas e erros de horários com nossa plataforma inteligente projetada especificamente para veterinários e profissionais de estética pet.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={() => onNavigateToAuth('register')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-olive-600 hover:bg-olive-750 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-olive-900/15 hover:shadow-xl cursor-pointer hover:-translate-y-0.5 animate-pulse-subtle"
              >
                Experimentar 14 Dias Grátis
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#features"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 border border-stone-250 dark:border-stone-850 hover:bg-stone-100 dark:hover:bg-stone-900 font-bold text-sm rounded-2xl transition-all cursor-pointer text-stone-600 dark:text-stone-300"
              >
                Conhecer Recursos
              </a>
            </div>

            {/* Micro Benefícios */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-[10px] sm:text-xs font-bold text-stone-450 dark:text-stone-500 pt-4">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sem cartão de crédito no teste
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Dados seguros e privados
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Configuração em 2 minutos
              </div>
            </div>
          </div>

          {/* Mockup Interativo em CSS */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0 flex justify-center">
            <div className="relative w-full max-w-[360px] aspect-[4/3] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl p-4 flex flex-col justify-between overflow-hidden group select-none">
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
                        <span className="text-[7.5px] text-stone-400 font-medium">Banho & Tosa H. • Ed Gama</span>
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
                <span>Modo de Conexão: Real Supabase</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="py-20 sm:py-28 bg-white dark:bg-stone-900 border-y border-stone-200/80 dark:border-stone-800/70 relative transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header da Seção */}
          <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
            <span className="text-[9px] sm:text-xs font-black uppercase text-olive-600 dark:text-olive-400 tracking-wider">
              Recursos de Alta Performance
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 dark:text-stone-50 leading-tight">
              Tudo o que sua clínica precisa em um único lugar
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-semibold">
              Desenvolvemos uma ferramenta focada em usabilidade e agilidade operacional. Menos cliques para realizar as tarefas e mais tempo para cuidar dos pets.
            </p>
          </div>

          {/* Grid de Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-stone-50 dark:bg-stone-955 border border-stone-200/60 dark:border-stone-800/80 hover:border-olive-500/40 dark:hover:border-olive-500/30 hover:shadow-xl hover:shadow-stone-200/10 dark:hover:shadow-stone-950/20 transition-all group">
              <div className="w-10 h-10 rounded-2xl bg-olive-500/10 dark:bg-olive-950/30 text-olive-650 dark:text-olive-400 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
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
            <div className="p-6 rounded-3xl bg-stone-50 dark:bg-stone-955 border border-stone-200/60 dark:border-stone-800/80 hover:border-olive-500/40 dark:hover:border-olive-500/30 hover:shadow-xl hover:shadow-stone-200/10 dark:hover:shadow-stone-950/20 transition-all group">
              <div className="w-10 h-10 rounded-2xl bg-olive-500/10 dark:bg-olive-950/30 text-olive-650 dark:text-olive-400 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
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
            <div className="p-6 rounded-3xl bg-stone-50 dark:bg-stone-955 border border-stone-200/60 dark:border-stone-800/80 hover:border-olive-500/40 dark:hover:border-olive-500/30 hover:shadow-xl hover:shadow-stone-200/10 dark:hover:shadow-stone-950/20 transition-all group">
              <div className="w-10 h-10 rounded-2xl bg-olive-500/10 dark:bg-olive-950/30 text-olive-650 dark:text-olive-400 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-stone-850 dark:text-stone-100 group-hover:text-olive-650 dark:group-hover:text-olive-450 transition-colors">
                Controle Operacional & SaaS
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mt-2 font-medium">
                Acompanhe o status de atendimentos de ponta a ponta. Altere status para confirmado, pendente ou concluído, gerando gatilhos e controlando cobranças de forma integrada e descomplicada.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. WORKFLOW SECTION */}
      <section id="workflow" className="py-20 sm:py-28 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
            <span className="text-[9px] sm:text-xs font-black uppercase text-olive-600 dark:text-olive-400 tracking-wider">
              Simples e Prático
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 dark:text-stone-50 leading-tight">
              Sua clínica rodando em 3 passos simples
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Passo 1 */}
            <div className="text-center space-y-3 relative group">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow flex items-center justify-center text-lg font-black text-olive-600 dark:text-olive-400 transition-all group-hover:bg-olive-500 group-hover:text-white">
                1
              </div>
              <h4 className="font-extrabold text-sm text-stone-850 dark:text-stone-100">Registre sua clínica</h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-[240px] mx-auto font-medium">
                Cadastre o nome corporativo da sua clínica, proprietário e localização no formulário simplificado.
              </p>
            </div>

            {/* Passo 2 */}
            <div className="text-center space-y-3 relative group">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow flex items-center justify-center text-lg font-black text-olive-600 dark:text-olive-400 transition-all group-hover:bg-olive-500 group-hover:text-white">
                2
              </div>
              <h4 className="font-extrabold text-sm text-stone-850 dark:text-stone-100">Cadastre clientes e pets</h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-[240px] mx-auto font-medium">
                Registre tutores com contatos e seus respectivos pets especificando a espécie e raça (com suporte a customizadas).
              </p>
            </div>

            {/* Passo 3 */}
            <div className="text-center space-y-3 relative group">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow flex items-center justify-center text-lg font-black text-olive-600 dark:text-olive-400 transition-all group-hover:bg-olive-500 group-hover:text-white">
                3
              </div>
              <h4 className="font-extrabold text-sm text-stone-850 dark:text-stone-100">Organize os agendamentos</h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-[240px] mx-auto font-medium">
                Abra agendamentos em um clique, atualize o status da operação e envie alertas automáticos de cobrança.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION */}
      <section id="pricing" className="py-20 sm:py-28 bg-stone-100 dark:bg-stone-900/60 border-t border-stone-250/70 dark:border-stone-900 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-12">
            <span className="text-[9px] sm:text-xs font-black uppercase text-olive-600 dark:text-olive-400 tracking-wider">
              Plano de Assinatura Único
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 dark:text-stone-50 leading-tight">
              Preço transparente, sem pegadinhas ou custos ocultos
            </h2>
          </div>

          <div className="max-w-md mx-auto relative mt-6">
            {/* Efeito Glow atrás do card */}
            <div className="absolute inset-0 bg-olive-550/20 rounded-3xl blur-2xl -translate-y-4 scale-95 opacity-50 dark:opacity-35 pointer-events-none" />

            <div className="relative bg-white dark:bg-stone-955 border border-stone-250 dark:border-stone-800 shadow-xl rounded-3xl p-8 flex flex-col justify-between space-y-6 text-center">
              
              <div className="space-y-2">
                <span className="px-3 py-1 bg-olive-500/10 text-olive-650 dark:text-olive-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                  Plano Corporativo Completo
                </span>
                <h3 className="font-extrabold text-lg text-stone-850 dark:text-stone-100 pt-2">Acesso Ilimitado</h3>
                <p className="text-xs text-stone-450 dark:text-stone-500 font-semibold">Indicado para petshops, clínicas e profissionais independentes.</p>
              </div>

              {/* Preço */}
              <div className="py-4 border-y border-stone-150 dark:border-stone-850 flex flex-col items-center">
                <span className="text-[10px] font-bold text-stone-450 dark:text-stone-500 uppercase tracking-wider">Valor Mensal</span>
                <div className="flex items-baseline mt-1">
                  <span className="text-base font-bold text-stone-450 mr-1">R$</span>
                  <span className="text-4xl font-black text-stone-900 dark:text-stone-50 leading-none font-mono">97,00</span>
                  <span className="text-xs text-stone-450 dark:text-stone-500 ml-1.5">/mês</span>
                </div>
                <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-500 mt-2 block uppercase tracking-wider">
                  Teste grátis por 14 dias
                </span>
              </div>

              {/* Benefícios listados */}
              <ul className="text-left space-y-3.5 text-xs text-stone-600 dark:text-stone-300 font-semibold">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Agendamentos e serviços ilimitados
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Cadastro ilimitado de tutores e pets
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Acesso ao dashboard de métricas em tempo real
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Histórico e prontuário completo de cada pet
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Suporte dedicado por e-mail e WhatsApp
                </li>
              </ul>

              {/* CTA do Plano */}
              <button
                onClick={() => onNavigateToAuth('register')}
                className="w-full py-4 bg-olive-650 hover:bg-olive-750 text-white font-black text-sm rounded-2xl transition-all shadow-md shadow-olive-900/10 hover:shadow-lg cursor-pointer"
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

      {/* 6. CTA FINAL */}
      <section className="py-20 sm:py-28 relative overflow-hidden bg-white dark:bg-stone-950 border-t border-stone-200/80 dark:border-stone-900 transition-colors duration-200">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-olive-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 dark:text-stone-50 tracking-tight">
            Pronto para revolucionar a gestão da sua clínica?
          </h2>
          <p className="text-xs sm:text-sm text-stone-550 dark:text-stone-450 leading-relaxed max-w-xl mx-auto font-semibold">
            Junte-se a dezenas de clínicas que já modernizaram suas operações, reduziram faltas de clientes e otimizaram faturamentos com o ecossistema do PetSanny.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigateToAuth('register')}
              className="px-8 py-4 bg-olive-600 hover:bg-olive-750 text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-olive-900/15 hover:shadow-xl cursor-pointer inline-flex items-center gap-2 hover:-translate-y-0.5"
            >
              Criar Clínica Agora
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
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
