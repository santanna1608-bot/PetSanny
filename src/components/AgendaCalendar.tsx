import React, { useState } from 'react';
import { useAppointments } from '../contexts/AppointmentsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Clock, 
  Stethoscope, 
  Scissors, 
  Check, 
  CalendarDays,
  User,
  AlertTriangle
} from 'lucide-react';

export const AgendaCalendar: React.FC = () => {
  const { appointments, confirmAppointment, changeAppointmentStatus } = useAppointments();
  const { t, language } = useLanguage();
  const [viewMode, setViewMode] = useState<'today' | 'week'>('today');

  // Filtrar os agendamentos de acordo com o modo
  const getFilteredAppointments = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (viewMode === 'today') {
      return appointments.filter(app => app.appointment_date === todayStr);
    } else {
      // Ordenar por data e hora para a visualização semanal
      return [...appointments].sort((a, b) => {
        const dateDiff = a.appointment_date.localeCompare(b.appointment_date);
        if (dateDiff !== 0) return dateDiff;
        return a.appointment_time.localeCompare(b.appointment_time);
      });
    }
  };

  const filteredApps = getFilteredAppointments();

  // Formatar datas para melhor legibilidade
  const formatDateFriendly = (dateStr: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    if (dateStr === todayStr) return t('agenda.today');
    if (dateStr === tomorrowStr) return t('agenda.tomorrow');

    // Retorna formatado
    const [year, month, day] = dateStr.split('-');
    if (language === 'en') {
      return `${month}/${day}/${year}`;
    }
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (val: number) => {
    if (language === 'en') {
      return `$ ${val.toFixed(2)}`;
    }
    if (language === 'es') {
      return `€ ${val.toFixed(2)}`;
    }
    return `R$ ${val.toFixed(2)}`;
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm mb-8">
      {/* Header com seletores de abas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-150 dark:border-stone-800 pb-5 mb-6">
        <div>
          <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-olive-600 dark:text-olive-400" />
            {t('agenda.title')}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {t('agenda.subtitle')}
          </p>
        </div>
        <div className="flex bg-stone-100 dark:bg-stone-950 p-1 rounded-xl w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => setViewMode('today')}
            className={`flex-1 sm:flex-none text-center px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              viewMode === 'today'
                ? 'bg-white dark:bg-stone-900 text-stone-850 dark:text-stone-100 shadow-sm'
                : 'text-stone-555 dark:text-stone-400 hover:text-stone-850 dark:hover:text-stone-200'
            }`}
          >
            {t('agenda.view_today')}
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`flex-1 sm:flex-none text-center px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              viewMode === 'week'
                ? 'bg-white dark:bg-stone-900 text-stone-850 dark:text-stone-100 shadow-sm'
                : 'text-stone-555 dark:text-stone-400 hover:text-stone-850 dark:hover:text-stone-200'
            }`}
          >
            {t('agenda.view_week')}
          </button>
        </div>
      </div>

      {/* Legenda de Cores */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold mb-6 p-3 bg-stone-50 dark:bg-stone-955/40 rounded-xl border border-stone-150 dark:border-stone-800/80">
        <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider">
          {t('agenda.colors_legend')}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-blue-800 dark:text-blue-400 text-[11px]">{t('agenda.vet_desc')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-orange-500" />
          <span className="text-orange-800 dark:text-orange-400 text-[11px]">{t('agenda.aesthetic_desc')}</span>
        </div>
      </div>

      {/* Lista de Agendamentos */}
      {filteredApps.length === 0 ? (
        <div className="text-center py-12 bg-stone-50 dark:bg-stone-955/20 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">
          <CalendarDays className="w-10 h-10 text-stone-300 dark:text-stone-650 mx-auto mb-3" />
          <h4 className="font-bold text-stone-700 dark:text-stone-300 text-sm">{t('agenda.no_appointments')}</h4>
          <p className="text-xs text-stone-400 dark:text-stone-550 mt-1">
            {viewMode === 'today' ? t('agenda.no_appointments_today') : t('agenda.no_appointments_future')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const isVet = app.service_type === 'vet';
            const isPending = app.status === 'pending';
            const isCompleted = app.status === 'completed';

            // Cores baseadas na categoria exigida
            const categoryColors = isVet 
              ? {
                  border: 'border-blue-200 dark:border-blue-900/60 hover:border-blue-355',
                  bg: 'bg-blue-50/40 dark:bg-blue-950/10',
                  tag: 'bg-blue-100/60 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
                  accent: 'bg-blue-500',
                  text: 'text-blue-800 dark:text-blue-200',
                  icon: <Stethoscope className="w-4 h-4 text-blue-600 dark:text-blue-450" />
                }
              : {
                  border: 'border-orange-200 dark:border-orange-900/60 hover:border-orange-355',
                  bg: 'bg-orange-50/40 dark:bg-orange-950/10',
                  tag: 'bg-orange-100/60 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400',
                  accent: 'bg-orange-500',
                  text: 'text-orange-850 dark:text-orange-200',
                  icon: <Scissors className="w-4 h-4 text-orange-600 dark:text-orange-455" />
                };

            return (
              <div
                key={app.id}
                className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${categoryColors.border} ${categoryColors.bg} shadow-sm gap-4`}
              >
                {/* Lado Esquerdo: Horário, Categoria e Detalhes do Pet */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                  {/* Horário & Data */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={`p-2.5 rounded-xl text-white font-bold flex flex-col items-center justify-center min-w-[70px] ${categoryColors.accent}`}>
                      <span className="text-[10px] uppercase font-sans font-medium tracking-wide">
                        {formatDateFriendly(app.appointment_date)}
                      </span>
                      <span className="text-sm font-sans flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        {app.appointment_time}
                      </span>
                    </div>
                  </div>

                  {/* Informações Principais */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-stone-850 dark:text-stone-100 text-sm font-sans">
                        {app.pet_name}
                      </span>
                      <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">
                        ({app.pet_species})
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${categoryColors.tag}`}>
                        {categoryColors.icon}
                        {isVet ? t('service.vet') : t('service.aesthetic')}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-stone-700 dark:text-stone-300 leading-snug">
                      {t('appointment.service')} <span className="text-stone-850 dark:text-stone-100">{app.service_name}</span>
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-stone-500 dark:text-stone-400 font-medium flex-wrap pt-0.5">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {t('appointment.tutor')}: {app.tutor_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {t('appointment.professional')}: {app.professional_name}
                      </span>
                      <span className="flex items-center gap-0.5 text-stone-600 dark:text-stone-300 font-bold bg-white/70 dark:bg-stone-800/80 px-1.5 py-0.5 rounded border border-stone-150 dark:border-stone-800">
                        {formatCurrency(Number(app.price))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direita: Alertas Rápidos do Pet & Controles */}
                <div className="flex items-center gap-3 shrink-0 flex-wrap justify-between md:justify-end border-t md:border-t-0 border-stone-150/60 dark:border-stone-800/60 pt-3 md:pt-0 w-full md:w-auto">
                  {/* Observação rápida se houver */}
                  {app.critical_notes && (
                    <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-955/30 border border-rose-100 dark:border-rose-900/40 text-rose-700 dark:text-rose-350 px-2 py-1 rounded-lg text-[10px] font-bold max-w-full sm:max-w-[220px] truncate shadow-sm">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{app.critical_notes}</span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-xl shadow-inner ${
                    isCompleted
                      ? 'bg-stone-200 dark:bg-stone-850 text-stone-600 dark:text-stone-300'
                      : isPending
                      ? 'bg-amber-100 dark:bg-amber-955/40 text-amber-700 dark:text-amber-450 border border-amber-200 dark:border-amber-900/50'
                      : 'bg-emerald-100 dark:bg-emerald-955/40 text-emerald-700 dark:text-emerald-450 border border-emerald-200 dark:border-emerald-900/50'
                  }`}>
                    {isCompleted ? t('status.completed') : isPending ? t('status.pending') : t('status.confirmed')}
                  </span>

                  {/* Botões de Ação */}
                  <div className="flex items-center gap-2">
                    {isPending && (
                      <button
                        onClick={() => confirmAppointment(app.id, app.tutor_email, app.pet_name)}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-xl shadow transition-colors cursor-pointer"
                        title="Confirmar atendimento e disparar notifications automáticas"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {t('action.confirm')}
                      </button>
                    )}
                    
                    {!isCompleted && !isPending && (
                      <button
                        onClick={() => changeAppointmentStatus(app.id, 'completed')}
                        className="flex items-center gap-1 bg-stone-700 hover:bg-stone-850 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-xl shadow transition-colors cursor-pointer"
                        title="Marcar atendimento como concluído"
                      >
                        {t('action.finalize')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
