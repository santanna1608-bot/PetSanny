import { useCallback, useEffect, useState } from 'react';
import { Sparkles, Check, ShieldCheck, ArrowUpRight, Zap, RefreshCw } from 'lucide-react';
import plans from '../../shared/plans.json';
import { SupportContact } from './SupportContact';
import { requireSupabase } from '../lib/supabaseClient';
import { useAppointments } from '../contexts/AppointmentsContext';

type Order = {
  id: string;
  plan_id: string;
  amount: number;
  status: string;
  environment: string;
  created_at: string;
};

const labels: Record<string, string> = {
  creating: 'Preparando',
  active: 'Aguardando pagamento',
  paid: 'Pagamento confirmado',
  canceled: 'Cancelado',
  expired: 'Expirado',
  failed: 'Falhou',
  unknown: 'Conferência necessária no Asaas'
};

const planTierMap: Record<string, number> = {
  essencial: 1,
  Bronze: 1,
  crescer: 2,
  Silver: 2,
  profissional: 3,
  Gold: 3
};

const planDisplayMap: Record<string, string> = {
  Bronze: 'Essencial',
  Silver: 'Crescer',
  Gold: 'Profissional'
};

const statusDisplayMap: Record<string, { label: string; badgeClass: string }> = {
  active: { label: 'Assinatura Ativa', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  trial: { label: 'Período de Testes', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' },
  suspended: { label: 'Assinatura Suspensa', badgeClass: 'bg-rose-50 text-rose-800 border-rose-200' },
  canceled: { label: 'Assinatura Cancelada', badgeClass: 'bg-stone-100 text-stone-700 border-stone-200' }
};

export function BillingCenter() {
  const { currentTenant } = useAppointments();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [environment, setEnvironment] = useState('');
  const [enabled, setEnabled] = useState(false);

  const call = useCallback(
    async (method: string, planId?: string) => {
      const { data } = await requireSupabase().auth.getSession();
      if (!data.session) throw Error('Entre novamente para consultar a cobrança.');
      const response = await fetch(
        '/api/billing' + (method === 'GET' ? '?tenantId=' + encodeURIComponent(currentTenant.id) : ''),
        {
          method,
          headers: {
            Authorization: 'Bearer ' + data.session.access_token,
            'Content-Type': 'application/json'
          },
          ...(method === 'POST'
            ? { body: JSON.stringify({ action: 'checkout', tenantId: currentTenant.id, planId }) }
            : {})
        }
      );
      const body = await response.json().catch(() => ({
        error: 'Cobrança disponível apenas no ambiente publicado, após configurar o Asaas.'
      }));
      if (
        !response.ok ||
        body.error ||
        !['sandbox', 'production'].includes(body.environment) ||
        (method === 'GET' && !Array.isArray(body.orders))
      ) {
        throw Error(body.error || 'Não foi possível consultar o Asaas.');
      }
      setEnvironment(body.environment);
      if (method === 'GET') setEnabled(body.enabled === true);
      return body;
    },
    [currentTenant.id]
  );

  useEffect(() => {
    let stale = false;
    void call('GET')
      .then(body => {
        if (!stale) setOrders(body.orders);
      })
      .catch(e => {
        if (!stale) setError(e.message);
      });
    return () => {
      stale = true;
    };
  }, [call]);

  const currentTier = planTierMap[currentTenant.plan || 'Bronze'] || 1;
  const currentPlanName = planDisplayMap[currentTenant.plan || 'Bronze'] || currentTenant.plan || 'Essencial';
  const statusInfo = statusDisplayMap[currentTenant.status || 'trial'] || {
    label: currentTenant.status,
    badgeClass: 'bg-stone-100 text-stone-700 border-stone-200'
  };

  const handleSelectPlan = async (planId: string) => {
    setBusy(true);
    setError('');
    try {
      const body = await call('POST', planId);
      const url = new URL(body.url);
      if (
        url.protocol !== 'https:' ||
        !(body.environment === 'production'
          ? ['asaas.com', 'www.asaas.com']
          : ['sandbox.asaas.com']
        ).includes(url.hostname)
      ) {
        throw Error('Link de teste inválido.');
      }
      window.location.assign(body.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao criar checkout.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Planos e cobrança</h2>
        <p className="text-stone-500 mt-1">
          Asaas · {environment === 'production' ? 'Produção oficial' : environment === 'sandbox' ? 'Ambiente de testes (Sandbox)' : 'Verificando conexão…'}
        </p>
      </header>

      {/* Card de Status da Assinatura e Informação de Upgrade */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#526f39]/10 text-[#526f39] flex items-center justify-center shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                  Plano Atual: <span className="text-[#526f39]">{currentPlanName}</span>
                </h3>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusInfo.badgeClass}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {currentTenant.renewalDate
                  ? `Próxima renovação / vencimento: ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'America/Sao_Paulo' }).format(new Date(currentTenant.renewalDate.length === 10 ? currentTenant.renewalDate + 'T12:00:00Z' : currentTenant.renewalDate))}`
                  : 'Sem data de renovação definida.'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-stone-500 block">Clínica</span>
            <span className="font-semibold text-sm text-stone-800 dark:text-stone-200">{currentTenant.name}</span>
          </div>
        </div>

        <p className="text-sm text-stone-600 dark:text-stone-400 mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
          💡 <strong>Quer subir de nível?</strong> Escolha um dos planos superiores abaixo para fazer <strong>upgrade</strong>. Seus novos recursos e capacidade de IA entram em vigor assim que o pagamento for registrado pelo Asaas.
        </p>
      </div>

      <p className="p-4 rounded-xl bg-amber-50 text-amber-900 text-sm">
        {environment === 'production'
          ? enabled
            ? 'Assinatura mensal recorrente no cartão ou Pix via Asaas. Confira o plano e o valor no checkout antes de concluir.'
            : 'Cobrança real aguardando validação da integração. Nenhum checkout será aberto enquanto a configuração estiver pendente.'
          : 'Sandbox: os valores abaixo são usados em ambiente de testes. Nenhuma contratação real de cartão será debitada e os testes ajudam a validar o fluxo.'}
      </p>

      {error && (
        <p role="alert" className="border border-red-200 bg-red-50 text-red-800 rounded-xl p-4 text-sm font-medium">
          {error}
        </p>
      )}

      {/* Grid de Planos com Indicação de Upgrade */}
      <div className="grid lg:grid-cols-3 gap-6">
        {plans.map(p => {
          const planTier = planTierMap[p.id] || 1;
          const isCurrentPlan = currentTenant.status === 'active' && planTier === currentTier;
          const isUpgrade = planTier > currentTier;
          const isDowngrade = currentTenant.status === 'active' && planTier < currentTier;

          return (
            <article
              key={p.id}
              className={`relative bg-white dark:bg-stone-900 border rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between ${
                isCurrentPlan
                  ? 'border-[#526f39] shadow-md ring-2 ring-[#526f39]/20'
                  : isUpgrade && p.id === 'profissional'
                  ? 'border-amber-400/80 shadow-md'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-400'
              }`}
            >
              {/* Badges de destaque */}
              <div className="absolute -top-3 left-6">
                {isCurrentPlan ? (
                  <span className="bg-[#526f39] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Check size={12} strokeWidth={3} /> Seu Plano Atual
                  </span>
                ) : isUpgrade ? (
                  <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Sparkles size={12} /> ✨ Upgrade Disponível
                  </span>
                ) : null}
              </div>

              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white mt-1">{p.name}</h3>
                <p className="text-3xl font-bold mt-3 text-stone-900 dark:text-white">
                  R$ {p.price}
                  <span className="text-sm font-normal text-stone-500">/mês</span>
                </p>
                <p className="text-stone-500 text-sm mt-3 min-h-[40px]">{p.description}</p>
                <ul className="space-y-2.5 mt-5 mb-6 text-sm text-stone-600 dark:text-stone-300">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-[#526f39] font-bold">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <button
                  disabled={busy || !enabled || isCurrentPlan}
                  className={`w-full p-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? 'bg-stone-100 dark:bg-stone-800 text-stone-500 cursor-default opacity-80'
                      : isUpgrade
                      ? 'bg-[#526f39] hover:bg-[#435b2e] text-white shadow-sm hover:shadow-md disabled:opacity-50'
                      : 'bg-[#211f1b] hover:bg-stone-800 text-white disabled:opacity-50'
                  }`}
                  onClick={() => void handleSelectPlan(p.id)}
                >
                  {isCurrentPlan ? (
                    'Plano Atual'
                  ) : isUpgrade ? (
                    <>
                      <span>{environment === 'production' ? `Fazer upgrade para ${p.name}` : `Upgrade para ${p.name} (teste)`}</span>
                      <ArrowUpRight size={16} />
                    </>
                  ) : isDowngrade ? (
                    `Mudar para ${p.name}`
                  ) : environment === 'production' ? (
                    `Contratar ${p.name}`
                  ) : (
                    `Abrir checkout de teste (${p.name})`
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Histórico de Cobranças */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6">
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#526f39]" />
            <h3 className="font-bold text-stone-900 dark:text-white">Histórico de cobranças e assinaturas</h3>
          </div>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError('');
              try {
                setOrders((await call('GET')).orders);
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Erro ao atualizar histórico.');
              } finally {
                setBusy(false);
              }
            }}
            className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 border rounded-lg px-2.5 py-1.5 flex items-center gap-1"
          >
            <RefreshCw size={12} /> Atualizar
          </button>
        </div>
        <p className="text-xs text-stone-500 mt-1">
          O retorno da página de pagamento não confirma imediatamente a cobrança. Aguarde a notificação autenticada do Asaas.
        </p>
        {!orders.length && <p className="mt-4 text-sm text-stone-400">Nenhuma cobrança registrada até o momento.</p>}
        {orders.map(o => (
          <div key={o.id} className="border-t border-stone-100 dark:border-stone-800 py-3 mt-3 flex flex-wrap gap-3 justify-between items-center text-sm">
            <span>
              <strong>{plans.find(p => p.id === o.plan_id)?.name || o.plan_id}</strong> · R$ {Number(o.amount).toFixed(2)}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full font-medium">
                {labels[o.status] || o.status}
              </span>
              <span className="text-xs text-stone-400">
                {o.environment === 'production' ? 'Produção' : 'Teste'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-stone-500 leading-relaxed">
        Assinatura mensal recorrente com cobrança segura pelo Asaas. O assistente com IA está disponível durante um teste válido, com 10 consultas ao todo, e no Profissional ativo, com 100 consultas por mês compartilhadas pela clínica. WhatsApp automático ainda não está disponível.
      </p>

      <SupportContact />
    </section>
  );
}
