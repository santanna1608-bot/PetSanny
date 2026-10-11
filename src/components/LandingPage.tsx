import { ArrowRight, CalendarDays, HeartHandshake, ShieldCheck, Check, Sun, Moon, Sparkles, MessageCircle, Wallet, PawPrint, Headset, CheckCheck } from 'lucide-react';
import logo from '../assets/logo.png';
import plans from '../../shared/plans.json';

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
  ['Já posso contratar um plano pago?', 'Você pode começar pelo teste gratuito. Os valores apresentados são os preços previstos dos pacotes; a contratação paga está em preparação e ainda não está disponível. WhatsApp automático também não está disponível.'],
];

export function LandingPage({ onNavigateToAuth, theme, toggleTheme, isLoggedIn, onGoToDashboard }: Props) {
  const start = () => onNavigateToAuth('register');
  const cta = 'inline-flex items-center justify-center gap-3 rounded-full bg-olive-600 px-7 py-4 font-bold text-white transition-colors hover:bg-olive-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-olive-600';
  return <div className="min-h-screen bg-[#faf8f2] text-stone-900 dark:bg-stone-950 dark:text-stone-100">
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-[#faf8f2]/95 backdrop-blur dark:border-stone-800 dark:bg-stone-950/95">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <a href="#" aria-label="PetSanny início" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight"><img src={logo} alt="" className="h-10 w-10 rounded-full" />PetSanny</a>
        <nav aria-label="Navegação principal" className="order-last flex w-full justify-center gap-5 text-sm md:order-none md:w-auto md:gap-7"><a href="#features" className="hover:text-olive-600">Recursos</a><a href="#assistant" className="hover:text-olive-600">Assistente com IA</a><a href="#pricing" className="hover:text-olive-600">Planos</a></nav>
        <div className="flex items-center gap-4"><button onClick={toggleTheme} aria-label="Alternar tema" className="p-2">{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button><button onClick={() => isLoggedIn ? onGoToDashboard?.() : onNavigateToAuth('login')} className="text-sm font-bold">{isLoggedIn ? 'Meu painel' : 'Entrar'}</button></div>
      </div>
    </header>

    <main>
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-16 pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pb-24 lg:pt-24">
        <div>
          <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-olive-600/20 bg-olive-600/5 px-3 py-2 text-xs font-semibold text-olive-600"><span className="h-1.5 w-1.5 rounded-full bg-olive-600" />PARA CLÍNICAS VETERINÁRIAS E PETSHOPS</p>
          <h1 className="max-w-xl text-5xl font-extrabold leading-[1.06] tracking-tight sm:text-6xl lg:text-[4.5rem]">Sua equipe cuida.<br /><span className="font-serif font-normal italic text-olive-600">Sua rotina flui.</span></h1>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-stone-600 dark:text-stone-400">Agenda organizada, histórico do pet à mão e um assistente com IA para ajudar nas dúvidas do dia a dia. Tudo conectado no PetSanny.</p>
          <div className="mt-8 flex flex-wrap items-center gap-4"><button onClick={start} className={cta}>Começar meus 7 dias grátis<ArrowRight size={18} /></button><a href="#assistant" className="inline-flex items-center gap-2 text-sm font-semibold">Conhecer o assistente<ArrowRight size={15} /></a></div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-stone-500 dark:text-stone-400"><span className="flex items-center gap-1.5"><Check size={14} />Sem cartão</span><span className="flex items-center gap-1.5"><Check size={14} />10 consultas de IA no teste</span></div>
        </div>

        <div className="relative rounded-[2rem] bg-[#e7e9dc] p-4 sm:p-7 dark:bg-olive-600/10">
          <p className="mb-5 text-xs font-semibold tracking-widest text-stone-500 dark:text-stone-400">UMA ROTINA COM MAIS CONTEXTO</p>
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl dark:border-stone-700 dark:bg-stone-900">
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4 dark:border-stone-800"><span className="flex items-center gap-2 text-sm font-bold"><img src={logo} alt="" className="h-7 w-7 rounded-full" />Meu painel</span><span className="text-xs text-stone-400">Exemplo ilustrativo</span></div>
            <div className="p-5 sm:p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Cada etapa, bem acompanhada.</h2><CalendarDays className="text-olive-600" size={20} /></div>
              <div className="mt-5 rounded-xl border border-stone-200 p-4 dark:border-stone-700"><div className="flex items-center gap-3"><span className="rounded-xl bg-olive-600/10 p-2.5"><PawPrint size={22} className="text-olive-600" /></span><div><p className="text-sm font-bold">Banho e cuidados</p><p className="mt-1 text-xs text-stone-500">Do agendamento ao próximo retorno</p></div></div><div className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px] sm:text-xs">{['Agendado', 'Em atendimento', 'Pronto para buscar'].map((stage, i) => <div key={stage}><div className={`mb-2 h-1.5 rounded-full ${i < 2 ? 'bg-olive-600' : 'bg-stone-200 dark:bg-stone-700'}`} />{stage}</div>)}</div></div>
              <div className="mt-4 rounded-xl bg-[#f6f5ee] p-4 dark:bg-stone-800"><div className="flex items-center gap-2 text-sm font-bold text-olive-600"><Headset size={18} />Assistente com IA</div><p className="mt-3 text-sm">“O que preciso acompanhar hoje?”</p><p className="mt-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">Consulte a agenda e as pendências em uma conversa, sem mudar de contexto.</p></div>
            </div>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400"><ShieldCheck size={15} className="shrink-0 text-olive-600" />Dados organizados por clínica. Você controla o que compartilha com o tutor.</p>
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white px-6 py-9 dark:border-stone-800 dark:bg-stone-900"><div className="mx-auto grid max-w-7xl items-center gap-5 text-center sm:grid-cols-3"><p className="text-lg font-semibold">Menos informação espalhada.</p><p className="text-lg font-semibold">Mais clareza para a equipe.</p><p className="text-lg font-semibold text-olive-600">Mais atenção para cada pet.</p></div></section>

      <section id="features" className="mx-auto max-w-7xl scroll-mt-32 px-6 py-20 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6"><div><p className="text-xs font-bold tracking-widest text-olive-600">O CUIDADO COMEÇA NA ORGANIZAÇÃO</p><h2 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">A rotina cresce.<br />A organização precisa acompanhar.</h2></div><p className="max-w-sm text-sm leading-relaxed text-stone-500 dark:text-stone-400">Quando cada informação está no seu lugar, fica mais fácil saber o próximo passo. Do primeiro agendamento ao próximo retorno.</p></div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">{benefits.map(({ Icon, title, text, label }) => <article key={title} className="rounded-2xl border border-stone-200 bg-white p-7 sm:p-8 dark:border-stone-800 dark:bg-stone-900"><div className="mb-7 flex items-center gap-3"><Icon size={23} className="text-olive-600" /><span className="text-[10px] font-semibold tracking-widest text-stone-500">{label}</span></div><h3 className="text-2xl font-bold tracking-tight">{title}</h3><p className="mt-3 max-w-lg text-sm leading-relaxed text-stone-500 dark:text-stone-400">{text}</p></article>)}</div>
        <p className="mt-5 text-xs text-stone-500">Os recursos disponíveis variam por plano. Explore todos durante um teste válido.</p>
      </section>

      <section id="assistant" className="scroll-mt-32 bg-[#242d20] px-6 py-20 text-[#faf8f2] lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div><p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#c7d8a5]"><Sparkles size={16} />ASSISTENTE COM IA</p><h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">Tem uma dúvida?<br /><span className="font-serif font-normal italic text-[#c7d8a5]">Comece uma conversa.</span></h2><p className="mt-6 max-w-lg leading-relaxed text-stone-300">Pergunte como usar o sistema, peça um resumo da agenda ou prepare uma mensagem de retorno. O assistente ajuda a transformar informação em um próximo passo mais claro.</p><ul className="mt-7 space-y-4 text-sm">{['Respostas em linguagem natural sobre o PetSanny.', 'Agenda de hoje e pendências da sua clínica.', 'Mensagens sugeridas para você revisar e enviar.'].map(item => <li key={item} className="flex gap-3"><CheckCheck size={18} className="shrink-0 text-[#c7d8a5]" />{item}</li>)}</ul><a href="#pricing" className="mt-8 inline-flex items-center gap-2 font-bold text-[#c7d8a5]">Incluído no Profissional<ArrowRight size={17} /></a><p className="mt-3 text-xs text-stone-400">100 consultas por mês no plano · 10 consultas no teste gratuito</p></div>
          <div className="rounded-3xl border border-white/15 bg-white/5 p-6 sm:p-8"><div className="flex items-center gap-3 border-b border-white/10 pb-5"><span className="rounded-full bg-[#c7d8a5]/15 p-3"><Headset size={24} className="text-[#c7d8a5]" /></span><div><h3 className="font-bold">Assistente PetSanny</h3><p className="mt-1 text-xs text-stone-400">Exemplo de conversa · IA</p></div></div><div className="ml-8 mt-6 rounded-2xl rounded-tr-sm bg-[#c7d8a5] p-4 text-sm text-[#242d20]">Como posso combinar o retorno de um pet?</div><div className="mr-5 mt-4 rounded-2xl rounded-tl-sm bg-white/10 p-5 text-sm leading-relaxed"><p className="mb-3 text-xs font-bold text-[#c7d8a5]">UMA SUGESTÃO PARA REVISAR</p>“Olá, [nome do tutor]! Aqui é da [nome da clínica]. Vamos combinar o próximo retorno de [nome do pet]? Qual dia e horário ficam melhores para você?”</div><p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-stone-400"><ShieldCheck size={16} className="shrink-0" />Você decide. O assistente não envia mensagens nem altera registros. Não oferece diagnóstico ou prescrição.</p></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20"><div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]"><div><p className="text-xs font-bold tracking-widest text-olive-600">COMECE PELA SUA ROTINA</p><h2 className="mt-4 text-3xl font-extrabold tracking-tight">Sete dias para<br />experimentar na prática.</h2><p className="mt-4 text-sm leading-relaxed text-stone-500">Sem cartão para iniciar. Você conhece o sistema antes de dar o próximo passo.</p></div><div className="grid gap-6 sm:grid-cols-3">{[['01', 'Crie sua clínica', 'Cadastre-se e confirme seu e-mail para começar.'], ['02', 'Organize o dia', 'Cadastre tutor, pet e atendimento com os dados da sua rotina.'], ['03', 'Converse com a IA', 'Use as 10 consultas do teste para explorar o assistente.']].map(([number, title, text]) => <article key={number} className="border-t border-stone-300 pt-6 dark:border-stone-700"><p className="font-serif text-4xl italic text-olive-600">{number}</p><h3 className="mt-5 font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-stone-500">{text}</p></article>)}</div></div></section>

      <section id="pricing" className="scroll-mt-32 border-y border-stone-200 bg-white px-6 py-20 dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto max-w-7xl"><p className="text-center text-xs font-bold tracking-widest text-olive-600">UM PLANO PARA CADA FASE</p><h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Comece simples. Cresça com contexto.</h2><p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-stone-500">Experimente por 7 dias. Estes são os preços previstos dos pacotes; a contratação paga está em preparação e ainda não está disponível.</p><div className="mt-12 grid items-stretch gap-5 lg:grid-cols-3">{plans.map((plan, i) => <article key={plan.id} className={`relative flex flex-col rounded-2xl border p-7 sm:p-8 ${i === 2 ? 'border-olive-600 bg-[#f4f6ed] dark:bg-olive-600/10' : 'border-stone-200 bg-[#faf8f2] dark:border-stone-700 dark:bg-stone-950'}`}>{i === 2 && <span className="absolute -top-3 left-7 rounded-full bg-olive-600 px-3 py-1 text-[10px] font-bold tracking-wider text-white">COM ASSISTENTE IA</span>}<h3 className="text-xl font-bold">{plan.name}</h3><p className="mt-3 min-h-10 text-sm text-stone-500 dark:text-stone-400">{plan.description}</p><p className="mt-6 text-4xl font-extrabold tracking-tight"><span className="mr-1 text-xl font-normal">R$</span>{plan.price}<span className="text-sm font-normal tracking-normal text-stone-500">/mês</span></p><ul className="my-7 flex-1 space-y-4 text-sm">{plan.features.map(feature => <li key={feature} className="flex items-start gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-olive-600" />{feature}</li>)}</ul><button onClick={start} className="w-full rounded-full border border-olive-600 bg-olive-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-olive-700">Começar teste gratuito<ArrowRight size={15} className="ml-2 inline" /></button></article>)}</div><p className="mt-6 text-center text-xs text-stone-500">Sem cartão no teste. WhatsApp automático ainda não está disponível.</p></div>
      </section>

      <section id="faq" className="mx-auto grid max-w-7xl scroll-mt-32 gap-10 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr]"><div><MessageCircle className="text-olive-600" size={30} /><h2 className="mt-5 text-3xl font-extrabold tracking-tight">Antes de começar,<br />vamos tirar as dúvidas.</h2><p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-500">Entenda o teste, os planos e o que o assistente pode fazer pela sua rotina.</p></div><div>{questions.map(([question, answer]) => <details key={question} className="group border-b border-stone-200 py-5 first:pt-0 dark:border-stone-800"><summary className="cursor-pointer font-semibold leading-relaxed">{question}</summary><p className="mt-4 text-sm leading-relaxed text-stone-500 dark:text-stone-400">{answer}</p></details>)}</div></section>

      <section className="mx-auto max-w-7xl px-6 pb-20"><div className="rounded-[2rem] bg-[#e7e9dc] px-7 py-12 text-center dark:bg-stone-900 sm:px-12 sm:py-16"><p className="text-xs font-bold tracking-widest text-olive-600">O PRÓXIMO PASSO É SEU</p><h2 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">Seu próximo atendimento<br /><span className="font-serif font-normal italic text-olive-600">pode começar mais organizado.</span></h2><p className="mx-auto mt-5 max-w-xl text-stone-600 dark:text-stone-400">Conheça o PetSanny na prática. Explore os recursos, converse com o assistente e veja como eles se encaixam na sua clínica.</p><button onClick={start} className={`${cta} mt-8`}>Experimentar grátis por 7 dias<ArrowRight size={18} /></button><p className="mt-4 text-xs text-stone-500">Sem cartão · Confirmação por e-mail · 10 consultas de IA</p></div></section>
    </main>
    <footer className="border-t border-stone-200 px-6 py-7 dark:border-stone-800"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4"><span className="font-bold">PetSanny</span><p className="text-xs text-stone-500">© {new Date().getFullYear()} · Mais contexto para cuidar melhor.</p><a href="#faq" className="text-xs text-stone-500">Dúvidas frequentes</a></div></footer>
  </div>;
}
