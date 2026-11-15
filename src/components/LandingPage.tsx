import { useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  HeartHandshake,
  ShieldCheck,
  Check,
  Sun,
  Moon,
  Sparkles,
  MessageCircle,
  Wallet,
  PawPrint,
  Headset,
  CheckCheck,
  ChevronDown,
  Clock,
  Sparkle
} from 'lucide-react';
import logo from '../assets/logo.png';
import plans from '../../shared/plans.json';
import { SupportContact } from './SupportContact';
import { LegalTermsModal } from './LegalTermsModal';

interface Props {
  onNavigateToAuth: (mode: 'login' | 'register') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isLoggedIn?: boolean;
  onGoToDashboard?: () => void;
}

const benefits = [
  { Icon: CalendarDays, title: 'Enxergue o dia inteiro.', text: 'Organize horários, serviços e profissionais. Acompanhe confirmações e encontre oportunidades na lista de espera.', label: 'AGENDA E OPERAÇÃO' },
  { Icon: PawPrint, title: 'O histórico acompanha o pet.', text: 'Cadastros, prontuário e passaporte de cuidados ajudam sua equipe a manter o contexto entre um atendimento e outro.', label: 'CONTINUIDADE DO CUIDADO' },
  { Icon: HeartHandshake, title: 'Deixe o tutor por dentro.', text: 'Compartilhe um link para acompanhar o atendimento, confirmar presença e solicitar mudanças, com acesso limitado e prazo.', label: 'PORTAL DO TUTOR' },
  { Icon: Wallet, title: 'Veja os números com clareza.', text: 'Reúna receitas, despesas e estoque para consultar o que foi registrado, sem confundir agendamentos com dinheiro recebido.', label: 'FINANCEIRO E ESTOQUE' },
];

const questions = [
  ['Como funcionam os 7 dias grátis?', 'Cadastre sua clínica, confirme o e-mail e explore os recursos durante 7 dias, sem informar cartão. O assistente inclui 10 consultas ao todo no teste.'],
  ['O assistente responde dúvidas sobre o sistema?', 'Sim. Ele explica o uso da agenda, dos cadastros, do financeiro e do portal do tutor. Também resume a agenda de hoje, consulta pendências e prepara mensagens de retorno para sua revisão. Seu conhecimento é limitado às informações disponíveis no sistema.'],
  ['Em qual plano o assistente está incluído?', 'No Profissional, com 100 consultas por mês compartilhadas pela clínica. Durante um teste gratuito válido, há 10 consultas ao todo. Cada pedido ao assistente conta como uma consulta.'],
  ['A IA altera registros ou envia mensagens?', 'Não. O assistente ajuda a consultar e preparar textos. Você revisa e decide o que fazer. Ele não envia mensagens, não altera a agenda e não oferece diagnóstico ou prescrição. Não inclua dados pessoais ou prontuários nas perguntas.'],
  ['O tutor precisa criar uma conta?', 'Para acompanhar o atendimento compartilhado, o tutor usa um link válido por 48 horas. A clínica pode revogá-lo. O link dá acesso somente ao atendimento compartilhado.'],
  ['Como funciona a contratação de um plano pago?', 'Você pode começar pelo teste de 7 dias grátis. A qualquer momento, acesse o menu de cobrança para contratar a assinatura mensal com segurança via cartão pelo Asaas. Não há fidelidade e o cancelamento pode ser feito quando desejar.'],
];

export function LandingPage({ onNavigateToAuth, theme, toggleTheme, isLoggedIn, onGoToDashboard }: Props) {
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'terms' | 'privacy'>('terms');
  const openLegal = (tab: 'terms' | 'privacy') => {
    setLegalTab(tab);
    setLegalOpen(true);
  };
  const start = () => onNavigateToAuth('register');
  const cta = 'btn-cta-primary group inline-flex items-center justify-center gap-3 rounded-full bg-olive-600 px-8 py-4 font-bold text-white shadow-lg shadow-olive-900/20 hover:bg-olive-700 hover:shadow-xl hover:shadow-olive-900/30 transition-all active:scale-98 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-olive-600';

  return (
    <div className="min-h-screen bg-[#faf8f2] text-stone-900 dark:bg-stone-950 dark:text-stone-100 overflow-x-hidden relative selection:bg-olive-500 selection:text-white">
      {/* Luz ambiente / Aurora suave no topo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 overflow-hidden pointer-events-none -z-0">
        <div className="absolute -top-20 left-1/4 w-[500px] h-[300px] bg-olive-500/10 dark:bg-olive-600/15 rounded-full blur-[100px] animate-aurora" />
        <div className="absolute top-10 right-1/4 w-[400px] h-[260px] bg-amber-400/10 dark:bg-amber-500/10 rounded-full blur-[90px] animate-aurora [animation-delay:4s]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-[#faf8f2]/90 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/90 transition-colors">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <a href="#" aria-label="PetSanny início" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight group">
            <img src={logo} alt="PetSanny" className="h-10 w-10 rounded-full shadow-md group-hover:scale-105 group-hover:rotate-[-3deg] transition-transform duration-300" />
            <span className="font-sans">PetSanny</span>
          </a>

          <nav aria-label="Navegação principal" className="order-last flex w-full justify-center gap-6 text-sm font-medium md:order-none md:w-auto md:gap-8">
            <a href="#features" className="nav-link hover:text-olive-600 dark:hover:text-olive-400 transition-colors">Recursos</a>
            <a href="#assistant" className="nav-link hover:text-olive-600 dark:hover:text-olive-400 transition-colors flex items-center gap-1.5">
              <span>Assistente com IA</span>
              <Sparkles size={13} className="text-olive-600 dark:text-olive-400 animate-pulse" />
            </a>
            <a href="#pricing" className="nav-link hover:text-olive-600 dark:hover:text-olive-400 transition-colors">Planos</a>
            <a href="#faq" className="nav-link hover:text-olive-600 dark:hover:text-olive-400 transition-colors">Dúvidas</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Alternar tema"
              className="p-2.5 rounded-full border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-850 text-stone-600 dark:text-stone-300 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} className="text-amber-400 animate-spin-slow" />}
            </button>
            <button
              onClick={() => (isLoggedIn ? onGoToDashboard?.() : onNavigateToAuth('login'))}
              className="px-5 py-2 text-sm font-bold rounded-full border border-stone-300 dark:border-stone-700 hover:border-olive-600 hover:text-olive-600 dark:hover:border-olive-400 dark:hover:text-olive-400 bg-white/70 dark:bg-stone-900/70 transition-all cursor-pointer active:scale-95 shadow-xs"
            >
              {isLoggedIn ? 'Meu painel' : 'Entrar'}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-16 pt-12 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:pb-24 lg:pt-20">
          <div className="animate-fade-in-up">
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-olive-600/25 bg-olive-600/10 px-3.5 py-1.5 text-xs font-semibold text-olive-700 dark:text-olive-300 shadow-xs backdrop-blur-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-olive-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-olive-600"></span>
              </span>
              <span>PARA CLÍNICAS VETERINÁRIAS E PETSHOPS</span>
            </div>

            <h1 className="max-w-xl text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.3rem]">
              Sua equipe cuida.<br />
              <span className="font-serif font-normal italic text-olive-600 dark:text-olive-400 underline decoration-olive-500/20 underline-offset-8">
                Sua rotina flui.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-relaxed text-stone-600 dark:text-stone-300">
              Agenda sincronizada, prontuário do pet sempre à mão e um assistente com IA para responder dúvidas do dia a dia. Tudo integrado no PetSanny.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button onClick={start} className={cta}>
                <span>Começar meus 7 dias grátis</span>
                <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
              </button>
              <a
                href="#assistant"
                className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-olive-600 dark:hover:text-olive-400 transition-colors p-2 cursor-pointer group"
              >
                <span>Conhecer o assistente</span>
                <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-olive-600" /> Sem cartão para testar
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-olive-600" /> 10 consultas de IA incluídas
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-olive-600" /> Cancele quando quiser
              </span>
            </div>
          </div>

          {/* MOCKUP DINÂMICO ILUSTRATIVO COM MOVIMENTO */}
          <div className="animate-float relative rounded-[2.5rem] bg-gradient-to-b from-[#e7e9dc] to-[#dedfc8] p-4 sm:p-7 dark:from-olive-950/40 dark:to-stone-900 border border-olive-600/25 shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-[11px] font-bold tracking-widest text-stone-600 dark:text-stone-300 uppercase flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Ambiente da Clínica · Ao Vivo
              </span>
              <span className="text-[10px] font-bold text-olive-700 dark:text-olive-300 bg-olive-600/15 px-2.5 py-0.5 rounded-full border border-olive-600/20">
                Sincronizado
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white/95 shadow-xl dark:border-stone-700/80 dark:bg-stone-900/95 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3.5 dark:border-stone-800">
                <span className="flex items-center gap-2.5 text-sm font-bold">
                  <img src={logo} alt="" className="h-7 w-7 rounded-full shadow-xs" />
                  <span>Painel PetCare Sanny</span>
                </span>
                <span className="text-[11px] font-medium text-stone-400 flex items-center gap-1">
                  <Clock size={12} /> Hoje
                </span>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold">Cada etapa bem acompanhada</h2>
                    <p className="text-xs text-stone-500">Fluxo operacional do dia</p>
                  </div>
                  <CalendarDays className="text-olive-600" size={20} />
                </div>

                <div className="rounded-xl border border-stone-200/90 p-4 dark:border-stone-700/90 bg-stone-50/50 dark:bg-stone-850/50 transition-all hover:border-olive-500/40">
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-olive-600/15 p-2.5 text-olive-600">
                      <PawPrint size={20} />
                    </span>
                    <div>
                      <p className="text-sm font-bold">Thor · Golden Retriever</p>
                      <p className="text-xs text-stone-500">Banho, Tosa e Consulta de Rotina</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] sm:text-xs">
                    {[
                      { name: 'Agendado', done: true },
                      { name: 'Em atendimento', done: true, active: true },
                      { name: 'Pronto p/ buscar', done: false }
                    ].map(stage => (
                      <div key={stage.name}>
                        <div
                          className={`mb-1.5 h-1.5 rounded-full transition-all ${
                            stage.active
                              ? 'bg-olive-600 animate-pulse'
                              : stage.done
                              ? 'bg-olive-600'
                              : 'bg-stone-200 dark:bg-stone-700'
                          }`}
                        />
                        <span className={stage.active ? 'font-bold text-olive-600' : 'text-stone-500'}>
                          {stage.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-gradient-to-br from-[#f5f6ed] to-[#edf0e2] p-4 dark:from-stone-850 dark:to-stone-800 border border-olive-500/20 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-olive-700 dark:text-olive-300">
                      <Headset size={16} />
                      <span>Assistente IA PetSanny</span>
                    </div>
                    <span className="text-[10px] bg-olive-600/15 text-olive-700 dark:text-olive-300 px-2 py-0.5 rounded-full font-semibold">
                      Pronto
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs font-semibold text-stone-800 dark:text-stone-200">
                    “O que preciso acompanhar na agenda de hoje?”
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-stone-600 dark:text-stone-400">
                    Você tem 8 atendimentos confirmados e 2 retornos prioritários para confirmação.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
              <ShieldCheck size={16} className="shrink-0 text-olive-600" />
              <span>Isolamento seguro por clínica. Você escolhe o que compartilha com o tutor.</span>
            </p>
          </div>
        </section>

        {/* IMPACT STRIP */}
        <section className="border-y border-stone-200/80 bg-white/80 backdrop-blur-xs px-6 py-8 dark:border-stone-800 dark:bg-stone-900/80">
          <div className="mx-auto grid max-w-7xl items-center gap-5 text-center sm:grid-cols-3">
            <div className="p-2 transition-transform hover:-translate-y-0.5">
              <p className="text-lg font-bold text-stone-900 dark:text-stone-100">Menos informação espalhada.</p>
              <p className="text-xs text-stone-500 mt-1">Tudo centralizado em um só painel.</p>
            </div>
            <div className="p-2 transition-transform hover:-translate-y-0.5">
              <p className="text-lg font-bold text-stone-900 dark:text-stone-100">Mais clareza para a equipe.</p>
              <p className="text-xs text-stone-500 mt-1">Horários, profissionais e histórico sincronizados.</p>
            </div>
            <div className="p-2 transition-transform hover:-translate-y-0.5">
              <p className="text-lg font-bold text-olive-600 dark:text-olive-400">Mais atenção para cada pet.</p>
              <p className="text-xs text-stone-500 mt-1">Menos burocracia, mais cuidado real.</p>
            </div>
          </div>
        </section>

        {/* BENEFÍCIOS / RECURSOS COM CARDS ANIMADOS */}
        <section id="features" className="mx-auto max-w-7xl scroll-mt-28 px-6 py-20 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold tracking-widest text-olive-600">O CUIDADO COMEÇA NA ORGANIZAÇÃO</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                A rotina cresce.<br />A organização precisa acompanhar.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-stone-500 dark:text-stone-400">
              Quando cada informação está no seu lugar, fica mais fácil saber o próximo passo. Do primeiro agendamento ao próximo retorno.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {benefits.map(({ Icon, title, text, label }) => (
              <article
                key={title}
                className="feature-card-hover group relative rounded-2xl border border-stone-200/90 bg-white p-7 sm:p-8 dark:border-stone-800 dark:bg-stone-900 overflow-hidden shadow-xs"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-olive-50 dark:bg-olive-950/40 border border-olive-200/60 dark:border-olive-800/60 flex items-center justify-center text-olive-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-3deg] group-hover:bg-olive-600 group-hover:text-white shadow-xs">
                    <Icon size={22} />
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full">
                    {label}
                  </span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 group-hover:text-olive-600 dark:group-hover:text-olive-400 transition-colors">
                  {title}
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                  {text}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-6 text-xs text-stone-500">
            Os recursos disponíveis variam por plano. Explore todos durante um teste gratuito de 7 dias.
          </p>
        </section>

        {/* ASSISTENTE COM IA COM VISUAL MODERNO E FLUIDO */}
        <section id="assistant" className="scroll-mt-28 bg-[#1f281c] px-6 py-20 text-[#faf8f2] lg:py-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c7d8a5]/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20 relative z-10">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#c7d8a5] bg-[#c7d8a5]/10 px-3 py-1 rounded-full border border-[#c7d8a5]/20">
                <Sparkles size={14} className="animate-pulse" />
                ASSISTENTE COM IA
              </p>
              <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                Tem uma dúvida?<br />
                <span className="font-serif font-normal italic text-[#c7d8a5]">Comece uma conversa.</span>
              </h2>
              <p className="mt-6 max-w-lg leading-relaxed text-stone-300">
                Pergunte como usar o sistema, peça um resumo da agenda ou prepare uma mensagem de retorno. O assistente ajuda a transformar informação em um próximo passo mais claro.
              </p>

              <ul className="mt-7 space-y-3.5 text-sm">
                {[
                  'Respostas em linguagem natural sobre o PetSanny.',
                  'Resumo da agenda de hoje e pendências da sua clínica.',
                  'Mensagens sugeridas para você revisar e enviar aos tutores.'
                ].map(item => (
                  <li key={item} className="flex gap-3 items-center">
                    <CheckCheck size={18} className="shrink-0 text-[#c7d8a5]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#pricing"
                className="mt-8 inline-flex items-center gap-2 font-bold text-[#c7d8a5] hover:text-white transition-colors group"
              >
                <span>Incluído no Plano Profissional</span>
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </a>
              <p className="mt-2 text-xs text-stone-400">
                100 consultas por mês no plano · 10 consultas no teste gratuito
              </p>
            </div>

            {/* CHAT INTERATIVO MOCKUP */}
            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 sm:p-8 backdrop-blur-md shadow-2xl transition-all hover:border-[#c7d8a5]/30">
              <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                <span className="rounded-full bg-[#c7d8a5]/15 p-3 text-[#c7d8a5]">
                  <Headset size={24} />
                </span>
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    Assistente PetSanny
                    <span className="text-[10px] bg-[#c7d8a5]/20 text-[#c7d8a5] px-2 py-0.5 rounded-full font-bold">
                      Online
                    </span>
                  </h3>
                  <p className="mt-0.5 text-xs text-stone-400">Exemplo de interação inteligente com IA</p>
                </div>
              </div>

              <div className="ml-8 mt-6 rounded-2xl rounded-tr-sm bg-[#c7d8a5] p-4 text-sm font-medium text-[#1f281c] shadow-md">
                Como posso combinar o retorno de vacinação de um pet?
              </div>

              <div className="mr-5 mt-4 rounded-2xl rounded-tl-sm bg-white/10 border border-white/10 p-5 text-sm leading-relaxed shadow-lg">
                <p className="mb-2.5 text-[11px] font-bold text-[#c7d8a5] tracking-wide flex items-center gap-1.5">
                  <Sparkle size={12} /> SUGESTÃO PRONTA PARA REVISAR
                </p>
                <p className="text-stone-200">
                  “Olá, [nome do tutor]! Aqui é da [nome da clínica]. Notamos que a próxima dose de vacina do [nome do pet] está prevista para os próximos dias. Vamos agendar o melhor dia e horário para você?”
                </p>
              </div>

              <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-stone-400">
                <ShieldCheck size={16} className="shrink-0 text-[#c7d8a5] mt-0.5" />
                <span>Você no controle: o assistente sugere textos para sua revisão. Não envia mensagens automáticas sem seu aval e não fornece diagnósticos médicos.</span>
              </p>
            </div>
          </div>
        </section>

        {/* PASSO A PASSO COM MICROINTERAÇÕES */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] items-center">
            <div>
              <p className="text-xs font-bold tracking-widest text-olive-600">COMECE PELA SUA ROTINA</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Sete dias para<br />experimentar na prática.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-stone-500">
                Sem cartão de crédito para iniciar. Você valida o sistema completo com a sua equipe antes de dar o próximo passo.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {[
                ['01', 'Crie sua clínica', 'Cadastre-se e confirme seu e-mail para ter acesso imediato.'],
                ['02', 'Organize o dia', 'Cadastre tutores, pets e veja sua agenda ganhar vida.'],
                ['03', 'Converse com a IA', 'Use as 10 consultas do teste para explorar o assistente.']
              ].map(([number, title, text]) => (
                <article
                  key={number}
                  className="group border-t-2 border-stone-200 dark:border-stone-800 hover:border-olive-500 pt-6 transition-all duration-300"
                >
                  <p className="font-serif text-4xl italic text-olive-600 dark:text-olive-400 group-hover:translate-x-1 transition-transform">
                    {number}
                  </p>
                  <h3 className="mt-4 font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-olive-600 transition-colors">
                    {title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING SECTION COM DESTAQUE ANIMADO NO PLANO GOLD */}
        <section id="pricing" className="scroll-mt-28 border-y border-stone-200/80 bg-white px-6 py-20 dark:border-stone-800 dark:bg-stone-900">
          <div className="mx-auto max-w-7xl">
            <p className="text-center text-xs font-bold tracking-widest text-olive-600">UM PLANO PARA CADA FASE</p>
            <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
              Comece simples. Cresça com contexto.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-stone-500">
              Experimente por 7 dias grátis. Assinatura mensal recorrente sem fidelidade, cancele quando quiser com um clique.
            </p>

            <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
              {plans.map((plan, i) => {
                const isGold = i === 2;
                return (
                  <article
                    key={plan.id}
                    className={`relative flex flex-col rounded-3xl p-7 sm:p-8 transition-all duration-300 ${
                      isGold
                        ? 'border-2 border-olive-600 bg-[#f4f6ed] dark:bg-olive-950/20 shadow-xl shadow-olive-900/10 lg:-translate-y-2 animate-gold-glow'
                        : 'border border-stone-200 bg-[#faf8f2] dark:border-stone-800 dark:bg-stone-950 hover:border-stone-300 dark:hover:border-stone-700 hover:-translate-y-1'
                    }`}
                  >
                    {isGold && (
                      <span className="absolute -top-3.5 left-7 rounded-full bg-olive-600 px-3.5 py-1 text-[10px] font-bold tracking-wider text-white shadow flex items-center gap-1">
                        <Sparkles size={12} /> COM ASSISTENTE IA
                      </span>
                    )}

                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="mt-2.5 min-h-10 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      {plan.description}
                    </p>

                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-sm font-normal text-stone-500">R$</span>
                      <span className={`text-4xl font-extrabold tracking-tight ${isGold ? 'price-shimmer' : ''}`}>
                        {plan.price}
                      </span>
                      <span className="text-xs font-medium text-stone-500">/mês</span>
                    </div>

                    <ul className="my-7 flex-1 space-y-3.5 text-xs">
                      {plan.features.map(feature => (
                        <li key={feature} className="flex items-start gap-2.5 leading-snug">
                          <Check size={16} className="mt-0.5 shrink-0 text-olive-600" />
                          <span className="text-stone-700 dark:text-stone-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={start}
                      className={`w-full rounded-full px-5 py-3.5 text-xs font-bold transition-all cursor-pointer active:scale-98 shadow-xs flex items-center justify-center gap-2 ${
                        isGold
                          ? 'bg-olive-600 text-white hover:bg-olive-700 shadow-md shadow-olive-900/20'
                          : 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800'
                      }`}
                    >
                      <span>Começar teste gratuito</span>
                      <ArrowRight size={14} />
                    </button>
                  </article>
                );
              })}
            </div>

            <p className="mt-6 text-center text-xs text-stone-500">
              Sem cartão no teste. WhatsApp automático ainda não está disponível.
            </p>
          </div>
        </section>

        {/* FAQ COM CHEVRON ANIMADO */}
        <section id="faq" className="mx-auto grid max-w-7xl scroll-mt-28 gap-10 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-olive-50 dark:bg-olive-950/40 border border-olive-200/60 dark:border-olive-800/60 flex items-center justify-center text-olive-600 mb-4 shadow-xs">
              <MessageCircle size={24} />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Antes de começar,<br />vamos tirar as dúvidas.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-500">
              Entenda o teste, os planos e o que o assistente inteligente pode fazer pela rotina da sua clínica.
            </p>
          </div>

          <div className="space-y-2">
            {questions.map(([question, answer]) => (
              <details
                key={question}
                className="group border-b border-stone-200 py-5 first:pt-0 dark:border-stone-800 transition-colors"
              >
                <summary className="flex items-center justify-between cursor-pointer font-semibold leading-relaxed hover:text-olive-600 transition-colors select-none list-none">
                  <span>{question}</span>
                  <ChevronDown size={18} className="text-stone-400 group-open:rotate-180 transition-transform duration-300 shrink-0 ml-4" />
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#e7e9dc] to-[#d8dbca] px-7 py-14 text-center dark:from-stone-900 dark:to-stone-850 sm:px-14 sm:py-18 overflow-hidden shadow-xl border border-stone-200/60 dark:border-stone-800">
            <div className="absolute top-0 right-1/3 w-64 h-64 bg-olive-500/10 rounded-full blur-3xl pointer-events-none" />
            <p className="text-xs font-bold tracking-widest text-olive-700 dark:text-olive-400">O PRÓXIMO PASSO É SEU</p>
            <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Seu próximo atendimento<br />
              <span className="font-serif font-normal italic text-olive-700 dark:text-olive-400">
                pode começar mais organizado.
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-stone-600 dark:text-stone-300 text-sm leading-relaxed">
              Conheça o PetSanny na prática. Explore os recursos, converse com o assistente e veja como tudo se encaixa na sua clínica.
            </p>
            <button onClick={start} className={`${cta} mt-8`}>
              <span>Experimentar grátis por 7 dias</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
            <p className="mt-4 text-xs text-stone-500">Sem cartão de crédito · Confirmação por e-mail · 10 consultas de IA</p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 pb-12">
          <SupportContact />
        </div>
      </main>

      <footer className="border-t border-stone-200 px-6 py-8 dark:border-stone-800 bg-white/50 dark:bg-stone-950/50 backdrop-blur-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="h-6 w-6 rounded-full" />
            <span className="font-bold">PetSanny</span>
          </div>
          <p className="text-xs text-stone-500">
            © {new Date().getFullYear()} · LF7 Marketing & IA · Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4 text-xs text-stone-500 font-medium">
            <button type="button" onClick={() => openLegal('terms')} className="hover:text-olive-600 transition-colors cursor-pointer">
              Termos de Uso
            </button>
            <span>•</span>
            <button type="button" onClick={() => openLegal('privacy')} className="hover:text-olive-600 transition-colors cursor-pointer">
              Privacidade (LGPD)
            </button>
            <span>•</span>
            <a href="#faq" className="hover:text-olive-600 transition-colors">
              Dúvidas frequentes
            </a>
          </div>
        </div>
      </footer>

      <LegalTermsModal isOpen={legalOpen} onClose={() => setLegalOpen(false)} initialTab={legalTab} />
    </div>
  );
}
