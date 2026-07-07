import React from 'react';
import { useAppointments } from '../contexts/AppointmentsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AlertCircle, ShieldAlert, Heart, Calendar } from 'lucide-react';

export const CriticalAlerts: React.FC = () => {
  const { appointments } = useAppointments();
  const { t } = useLanguage();

  // Filtrar os agendamentos que contêm notas críticas
  const criticalAppointments = appointments.filter(
    (app) => app.critical_notes && app.critical_notes.trim() !== ''
  );

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm mb-8">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
        <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100">
          {t('critical.manager')}
        </h3>
        <span className="bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
          {criticalAppointments.length} {t('critical.active')}
        </span>
      </div>

      <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
        {t('critical.desc')}
      </p>

      {criticalAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-stone-50 dark:bg-stone-955/20 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
          <Heart className="w-8 h-8 text-stone-300 dark:text-stone-700 mb-2" />
          <p className="text-xs text-stone-400 dark:text-stone-500 font-semibold">{t('critical.none')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criticalAppointments.map((app) => (
            <div
              key={app.id}
              className="p-4 rounded-xl bg-gradient-to-r from-rose-50 to-rose-50/30 dark:from-rose-950/20 dark:to-rose-950/5 border border-rose-100 dark:border-rose-900/30 shadow-sm relative overflow-hidden group hover:border-rose-250 dark:hover:border-rose-900 transition-colors"
            >
              {/* Marca decorativa lateral */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
              
              <div className="flex justify-between items-start mb-2 pl-2">
                <div>
                  <h4 className="font-bold text-stone-850 dark:text-stone-200 text-sm flex items-center gap-1.5">
                    {app.pet_name} 
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium font-sans">
                      ({app.pet_species})
                    </span>
                  </h4>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                    {t('appointment.tutor')}: {app.tutor_name} • {t('appointment.professional')}: {app.professional_name}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    app.service_type === 'vet' 
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30' 
                      : 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30'
                  }`}>
                    {app.service_type === 'vet' ? t('service.vet') : t('service.aesthetic')}
                  </span>
                  <div className="text-[9px] text-stone-400 dark:text-stone-550 font-medium mt-1 flex items-center justify-end gap-1">
                    <Calendar className="w-3 h-3 text-stone-400 dark:text-stone-500" />
                    {app.appointment_time}h
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-stone-900/80 rounded-lg p-2.5 border border-rose-100 dark:border-rose-900/30 mt-2 flex items-start gap-2 pl-2 shadow-inner">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-800 dark:text-rose-300 font-medium leading-relaxed">
                  {app.critical_notes}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
