// Auxiliary semantic check: only public copy and verified product facts are sent.
const state = {
 facts: ['Trial lasts seven days without a card.', 'Trial has ten assistant requests in total.', 'Professional plan has one hundred assistant requests per month.', 'Assistant explains system usage, summarizes today appointments and pending confirmations/reminders, and drafts return messages.', 'Assistant does not send messages, change records, diagnose or prescribe.', 'Paid subscriptions and automatic WhatsApp sending are not available.'],
 copy: ['Agenda organizada, histórico do pet à mão e um assistente com IA para ajudar nas dúvidas do dia a dia.', 'Pergunte como usar o sistema, peça um resumo da agenda ou prepare uma mensagem de retorno.', '100 consultas por mês no plano Profissional e 10 consultas no teste gratuito.', 'Você decide. O assistente não envia mensagens nem altera registros. Não oferece diagnóstico ou prescrição.', 'Estes são os preços previstos dos pacotes; a contratação paga está em preparação e ainda não está disponível.'],
};
if (!process.env.TYPESAFE_API_KEY) throw Error('Configure TYPESAFE_API_KEY no ambiente.');
const response = await fetch('https://api.typesafe.ai/v1/systemone', { method: 'POST', redirect: 'error', headers: { Authorization: `Bearer ${process.env.TYPESAFE_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({model:'jev-latest',state,questions:{supported:{type:'noul',instructions:'Are all product capability claims in copy supported by facts, without claims of autonomous actions, guaranteed business outcomes, or paid availability?'}}}),signal:AbortSignal.timeout(15000)});
if (!response.ok) throw Error('Falha na verificação semântica.');
const result = await response.json();
console.log(JSON.stringify({model:result.model,supported:result.answers?.supported?.noul}));
if (!(result.answers?.supported?.noul >= 0.8)) process.exitCode = 1;
