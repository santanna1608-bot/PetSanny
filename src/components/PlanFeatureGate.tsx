import type { ReactNode } from 'react';
import { useAppointments } from '../contexts/AppointmentsContext';
import { hasPlanFeature, type PlanFeature } from '../lib/planAccess';
import { localDate } from '../lib/dates';
export function PlanFeatureGate({ feature, children }: { feature: PlanFeature; children: ReactNode }) {
  const { currentTenant } = useAppointments();
  if (hasPlanFeature(currentTenant, feature, localDate())) return <>{children}</>;
  const plan = ['crm', 'connections', 'recoveryMetrics'].includes(feature) ? 'Profissional' : 'Crescer';
  return <section className="rounded-2xl border border-stone-200 dark:border-stone-800 p-6 mb-6">
    <p>Este recurso está disponível no plano {plan}.</p>
    <p className="text-sm text-stone-500">Consulte Planos e cobrança para conhecer os pacotes.</p>
  </section>;
}
