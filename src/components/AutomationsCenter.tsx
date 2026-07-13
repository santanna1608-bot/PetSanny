import React, { useState, useEffect } from 'react';
import { useAppointments } from '../contexts/AppointmentsContext';
import { 
  Zap, 
  MessageSquare, 
  Calendar, 
  Smile, 
  ChevronRight, 
  Clock, 
  Play, 
  FileText,
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
  const [rules, setRules] = useState<AutomationRule[]>([]);

  useEffect(() => {
    const cacheKey = `petsanny_automations_${currentTenant.id}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      setRules(JSON.parse(cached));
    } else {
      const defaultRules: AutomationRule[] = [
        {
          id: 'rule-1',
          name: 'Confirmação de Consulta & Lembrete',
          description: 'Gatilho disparado imediatamente após criar um agendamento com status Pendente.',
          trigger: 'Agendamento Criado',
          actions: ['Enviar Mensagem WhatsApp', 'Adicionar Google Calendar', 'Disparar lembrete 24h antes'],
          active: true
        },
        {
          id: 'rule-2',
          name: 'Alerta de Vacinas Próximas ao Vencimento',
          description: 'Disparado automaticamente 15 dias antes da data de expiração anual da vacina de um pet.',
          trigger: 'Validade de Vacina < 15 dias',
          actions: ['Pesquisar Tutor no CRM', 'Enviar WhatsApp Recomendando Retorno'],
          active: true
        },
        {
          id: 'rule-3',
          name: 'Pesquisa de Satisfação Pós-Atendimento',
          description: 'Envia um formulário rápido de Net Promoter Score (NPS) 2 horas após a conclusão do serviço.',
          trigger: 'Agendamento Concluído',
          actions: ['Aguardar 2 Horas', 'Enviar Link NPS via WhatsApp'],
          active: false
        },
        {
          id: 'rule-4',
          name: 'Fidelização de Pets Inativos (Reengajamento)',
          description: 'Identifica pets sem atendimentos nos últimos 90 dias e oferece uma oferta especial.',
          trigger: 'Inatividade > 90 Dias',
          actions: ['Identificar Tutor', 'Gerar Cupom de Desconto VIP', 'Enviar WhatsApp de Reengajamento'],
          active: true
        }
      ];
      setRules(defaultRules);
      localStorage.setItem(cacheKey, JSON.stringify(defaultRules));
    }
  }, [currentTenant]);

  const saveRules = (newRules: AutomationRule[]) => {
    localStorage.setItem(`petsanny_automations_${currentTenant.id}`, JSON.stringify(newRules));
    setRules(newRules);
  };

  const handleToggleRule = (id: string, name: string) => {
    const updated = rules.map(rule => rule.id === id ? { ...rule, active: !rule.active } : rule);
    const rule = updated.find(r => r.id === id);
    saveRules(updated);
    addToast(
      'Automação Alterada',
      `O fluxo "${name}" foi ${rule?.active ? 'ativado' : 'desativado'} com sucesso.`,
      'info'
    );
  };

  const getActionIcon = (action: string) => {
    if (action.includes('WhatsApp')) return <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />;
    if (action.includes('Calendar')) return <Calendar className="w-3.5 h-3.5 text-blue-500" />;
    if (action.includes('24h') || action.includes('Horas')) return <Clock className="w-3.5 h-3.5 text-amber-500" />;
    if (action.includes('Cupom') || action.includes('Recomendando')) return <Zap className="w-3.5 h-3.5 text-purple-500" />;
    return <Smile className="w-3.5 h-3.5 text-stone-500" />;
  };

  return (
    <div className="space-y-6 text-xs text-stone-850 dark:text-stone-150 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-150 dark:border-stone-850 pb-5">
        <div>
          <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-olive-650" />
            Central de Automações & Gatilhos (PetSanny Core)
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Configure e ative fluxos de inteligência operacional que eliminam tarefas repetitivas e aumentam a retenção de tutores.
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
                  <h4 className="font-extrabold text-stone-800 dark:text-stone-100 text-sm leading-tight">{rule.name}</h4>
                  <p className="text-[10px] text-stone-450 dark:text-stone-500 mt-1">{rule.description}</p>
                </div>
                
                {/* Switch Toggle */}
                <button
                  onClick={() => handleToggleRule(rule.id, rule.name)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 relative ${
                    rule.active ? 'bg-olive-600' : 'bg-stone-300 dark:bg-stone-800'
                  }`}
                  title={rule.active ? 'Desativar Automação' : 'Ativar Automação'}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                    rule.active ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Evento de Gatilho (Trigger) */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 dark:bg-stone-950 border dark:border-stone-850 text-stone-550 dark:text-stone-450 text-[9px] font-bold rounded-lg uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5 text-olive-650" />
                <span>Gatilho: {rule.trigger}</span>
              </div>
            </div>

            {/* Ações Encadeadas (Visual Workflow) */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block">Ações em Cadeia:</span>
              <div className="flex flex-wrap items-center gap-2">
                {rule.actions.map((act, index) => (
                  <React.Fragment key={index}>
                    <div className="flex items-center gap-1.5 p-2 bg-stone-50 dark:bg-stone-950/60 border dark:border-stone-850 rounded-xl">
                      {getActionIcon(act)}
                      <span className="font-bold text-[9px] text-stone-750 dark:text-stone-300">{act}</span>
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
