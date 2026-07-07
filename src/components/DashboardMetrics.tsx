import React from 'react';
import { useAppointments } from '../contexts/AppointmentsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  DollarSign, 
  Stethoscope, 
  Scissors, 
  AlertOctagon, 
  TrendingUp 
} from 'lucide-react';

export const DashboardMetrics: React.FC = () => {
  const { appointments } = useAppointments();
  const { t, language } = useLanguage();

  // 1. Faturamento Total do Mês (Considerando agendamentos confirmados ou concluídos)
  const revenue = appointments
    .filter(app => app.status === 'confirmed' || app.status === 'completed')
    .reduce((sum, app) => sum + Number(app.price), 0);

  // 2. Consultas Veterinárias Pendentes (service_type = 'vet' e status = 'pending')
  const pendingVetConsults = appointments
    .filter(app => app.service_type === 'vet' && app.status === 'pending')
    .length;

  // 3. Banhos/Tosas Agendados na Semana (aesthetic nos próximos 7 dias ou ativos)
  const aestheticServicesCount = appointments
    .filter(app => app.service_type === 'aesthetic')
    .length;

  // 4. Alertas Críticos (registros com notas críticas não nulas no tenant ativo)
  const criticalAlertsCount = appointments
    .filter(app => app.critical_notes && app.critical_notes.trim() !== '')
    .length;

  // Formatação de Moeda com base no Idioma
  const formatCurrency = (val: number) => {
    if (language === 'en') {
      return `$ ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (language === 'es') {
      return `€ ${val.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* CARD 1: FATURAMENTO */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-all duration-300 group">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider block mb-1">
              {t('dashboard.revenue_est')}
            </span>
            <h3 className="text-3xl font-extrabold text-stone-850 dark:text-stone-100 font-sans tracking-tight">
              {formatCurrency(revenue)}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-olive-500/10 dark:bg-olive-550/20 text-olive-600 dark:text-olive-450 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-emerald-600 dark:text-emerald-500">
          <TrendingUp className="w-4 h-4" />
          <span>{t('dashboard.revenue_desc')}</span>
        </div>
      </div>

      {/* CARD 2: CONSULTAS VET PENDENTES */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-all duration-300 group">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider block mb-1">
              {t('dashboard.vet_pending_title')}
            </span>
            <h3 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-sans tracking-tight">
              {pendingVetConsults}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Stethoscope className="w-6 h-6" />
          </div>
        </div>
        <div className="flex items-center mt-4 text-xs text-stone-500 dark:text-stone-450">
          <span>{t('dashboard.blue_color_desc')}</span>
        </div>
      </div>

      {/* CARD 3: BANHOS/TOSAS DA SEMANA */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-all duration-300 group">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider block mb-1">
              {t('dashboard.aesthetic_pet_title')}
            </span>
            <h3 className="text-3xl font-extrabold text-orange-600 dark:text-orange-400 font-sans tracking-tight">
              {aestheticServicesCount}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Scissors className="w-6 h-6" />
          </div>
        </div>
        <div className="flex items-center mt-4 text-xs text-stone-500 dark:text-stone-450">
          <span>{t('dashboard.orange_color_desc')}</span>
        </div>
      </div>

      {/* CARD 4: ALERTAS CRÍTICOS */}
      <div className={`rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all duration-300 group ${
        criticalAlertsCount > 0 
          ? 'bg-rose-50 dark:bg-rose-955/20 border-rose-200 dark:border-rose-900/40 text-rose-950 dark:text-rose-200' 
          : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800'
      }`}>
        <div className="flex justify-between items-start">
          <div>
            <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${
              criticalAlertsCount > 0 ? 'text-rose-600 dark:text-rose-455' : 'text-stone-500 dark:text-stone-400'
            }`}>
              {t('dashboard.critical_alerts_active')}
            </span>
            <h3 className={`text-3xl font-extrabold font-sans tracking-tight ${
              criticalAlertsCount > 0 ? 'text-rose-700 dark:text-rose-450 animate-pulse' : 'text-stone-850 dark:text-stone-100'
            }`}>
              {criticalAlertsCount}
            </h3>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
            criticalAlertsCount > 0 
              ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400' 
              : 'bg-stone-50 dark:bg-stone-950 text-stone-400 dark:text-stone-550'
          }`}>
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>
        <div className={`flex items-center mt-4 text-xs ${
          criticalAlertsCount > 0 ? 'text-rose-600 dark:text-rose-455 font-semibold' : 'text-stone-500 dark:text-stone-450'
        }`}>
          <span>{criticalAlertsCount > 0 ? t('dashboard.attention_required') : t('dashboard.no_critical_obs')}</span>
        </div>
      </div>
    </div>
  );
};
