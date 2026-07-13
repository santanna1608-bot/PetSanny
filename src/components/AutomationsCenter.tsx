import React, { useState, useEffect } from 'react';
import { useAppointments } from '../contexts/AppointmentsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Zap, 
  MessageSquare, 
  Calendar, 
  Smile, 
  ChevronRight, 
  Clock, 
  AlertCircle
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  active: boolean;
}

export const AutomationsCenter: React.FC = () => {
  const { currentTenant, addToast } = useAppointments();
  const { t } = useLanguage();
  const [rules, setRules] = useState<AutomationRule[]>([]);

  useEffect(() => {
    const cacheKey = `petsanny_automations_${currentTenant.id}`;
    const cached = localStorage.getItem(cacheKey);

    const defaultRules: AutomationRule[] = [
      {
        id: 'rule-1',
        name: 'automations.rule1.name',
        description: 'automations.rule1.desc',
        trigger: 'automations.rule1.trigger',
        actions: ['automations.rule1.action1', 'automations.rule1.action2', 'automations.rule1.action3'],
        active: true
      },
      {
        id: 'rule-2',
        name: 'automations.rule2.name',
        description: 'automations.rule2.desc',
        trigger: 'automations.rule2.trigger',
        actions: ['automations.rule2.action1', 'automations.rule2.action2'],
        active: true
      },
      {
        id: 'rule-3',
        name: 'automations.rule3.name',
        description: 'automations.rule3.desc',
        trigger: 'automations.rule3.trigger',
        actions: ['automations.rule3.action1', 'automations.rule3.action2'],
        active: false
      },
      {
        id: 'rule-4',
        name: 'automations.rule4.name',
        description: 'automations.rule4.desc',
        trigger: 'automations.rule4.trigger',
        actions: ['automations.rule4.action1', 'automations.rule4.action2', 'automations.rule4.action3'],
        active: true
      }
    ];

    if (cached) {
      const parsed = JSON.parse(cached);
      // Se for cache antigo com strings em português fixas, força migração
      if (parsed.length > 0 && !parsed[0].name.startsWith('automations.')) {
        setRules(defaultRules);
        localStorage.setItem(cacheKey, JSON.stringify(defaultRules));
      } else {
        setRules(parsed);
      }
    } else {
      setRules(defaultRules);
      localStorage.setItem(cacheKey, JSON.stringify(defaultRules));
    }
  }, [currentTenant]);

  const saveRules = (newRules: AutomationRule[]) => {
    localStorage.setItem(`petsanny_automations_${currentTenant.id}`, JSON.stringify(newRules));
    setRules(newRules);
  };

  const handleToggleRule = (id: string, ruleKey: string) => {
    const updated = rules.map(rule => rule.id === id ? { ...rule, active: !rule.active } : rule);
    const rule = updated.find(r => r.id === id);
    saveRules(updated);
    
    const translatedName = t(ruleKey);
    const bodyText = rule?.active 
      ? t('automations.toast_body_active').replace('{name}', translatedName)
      : t('automations.toast_body_inactive').replace('{name}', translatedName);

    addToast(
      t('automations.toast_title'),
      bodyText,
      'info'
    );
  };

  const getActionIcon = (action: string) => {
    if (
      action.includes('WhatsApp') || 
      action === 'automations.rule1.action1' || 
      action === 'automations.rule2.action2' || 
      action === 'automations.rule3.action2' || 
      action === 'automations.rule4.action3'
    ) {
      return <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />;
    }
    if (action.includes('Calendar') || action === 'automations.rule1.action2') {
      return <Calendar className="w-3.5 h-3.5 text-blue-500" />;
    }
    if (
      action.includes('24h') || 
      action.includes('Horas') || 
      action === 'automations.rule1.action3' || 
      action === 'automations.rule3.action1'
    ) {
      return <Clock className="w-3.5 h-3.5 text-amber-500" />;
    }
    if (
      action.includes('Cupom') || 
      action.includes('Recomendando') || 
      action === 'automations.rule2.action1' || 
      action === 'automations.rule4.action1' || 
      action === 'automations.rule4.action2'
    ) {
      return <Zap className="w-3.5 h-3.5 text-purple-500" />;
    }
    return <Smile className="w-3.5 h-3.5 text-stone-500" />;
  };

  return (
    <div className="space-y-6 text-xs text-stone-850 dark:text-stone-150 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-150 dark:border-stone-850 pb-5">
        <div>
          <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-olive-650" />
            {t('automations.title')}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {t('automations.desc')}
          </p>
        </div>
      </div>

      {/* Grid de Fluxos de Automação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rules.map((rule) => (
          <div 
            key={rule.id}
            className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-4 ${
              rule.active 
                ? 'bg-white dark:bg-stone-900 border-stone-250 dark:border-stone-800 shadow-sm' 
                : 'bg-stone-50/50 dark:bg-stone-955 border-stone-200 dark:border-stone-850 opacity-70'
            }`}
          >
            <div className="space-y-3">
              {/* Topo do Card: Nome e Interruptor */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="font-extrabold text-stone-800 dark:text-stone-100 text-sm leading-tight">{t(rule.name)}</h4>
                  <p className="text-[10px] text-stone-450 dark:text-stone-500 mt-1">{t(rule.description)}</p>
                </div>
                
                {/* Switch Toggle */}
                <button
                  onClick={() => handleToggleRule(rule.id, rule.name)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 relative ${
                    rule.active ? 'bg-olive-600' : 'bg-stone-300 dark:bg-stone-800'
                  }`}
                  title={rule.active ? t('automations.toggle_inactive') : t('automations.toggle_active')}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                    rule.active ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Evento de Gatilho (Trigger) */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 dark:bg-stone-950 border dark:border-stone-850 text-stone-550 dark:text-stone-450 text-[9px] font-bold rounded-lg uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5 text-olive-650" />
                <span>{t('automations.trigger_prefix')}: {t(rule.trigger)}</span>
              </div>
            </div>

            {/* Ações Encadeadas (Visual Workflow) */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block">{t('automations.actions_chain')}</span>
              <div className="flex flex-wrap items-center gap-2">
                {rule.actions.map((act, index) => (
                  <React.Fragment key={index}>
                    <div className="flex items-center gap-1.5 p-2 bg-stone-50 dark:bg-stone-950/60 border dark:border-stone-850 rounded-xl">
                      {getActionIcon(act)}
                      <span className="font-bold text-[9px] text-stone-750 dark:text-stone-300">{t(act)}</span>
                    </div>
                    {index < rule.actions.length - 1 && (
                      <ChevronRight className="w-3.5 h-3.5 text-stone-350 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
