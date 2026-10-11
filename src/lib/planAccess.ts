export type PlanFeature = 'recovery' | 'tutorPortal' | 'careStages' | 'recoveryMetrics' | 'crm' | 'connections';
type ClinicPlan = { plan?: string; status?: string; renewalDate?: string };
const minimum: Record<PlanFeature, number> = {
  recovery: 2, tutorPortal: 2, careStages: 2, recoveryMetrics: 3, crm: 3, connections: 3,
};
// Display only. PostgreSQL independently enforces access on writes and protected data.
export function hasPlanFeature(clinic: ClinicPlan, feature: PlanFeature, today: string): boolean {
  if (clinic.status === 'trial' && clinic.renewalDate && clinic.renewalDate >= today) return true;
  const rank = clinic.plan === 'Gold' ? 3 : clinic.plan === 'Silver' ? 2 : clinic.plan === 'Bronze' ? 1 : 0;
  return rank >= minimum[feature];
}
