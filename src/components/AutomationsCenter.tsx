import React, { useState, useEffect } from 'react';
import { useAppointments } from '../contexts/AppointmentsContext';
import { useLanguage } from '../contexts/LanguageContext';
import confetti from 'canvas-confetti';
import { 
  Zap, 
  MessageSquare, 
  Calendar, 
  Smile, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  Power, 
  RotateCcw, 
  Smartphone, 
  Wifi, 
  User, 
  ShieldCheck, 
  QrCode, 
  X, 
  Sliders, 
  Check,
  Activity
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

  // Estados da Conexão WhatsApp / Evolution API
  const [isConnected, setIsConnected] = useState(true);
  const [connectedUser] = useState('Luiz Fernando Santana');
  const [connectedPhone, setConnectedPhone] = useState('5521981062423');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showConfigDetails, setShowConfigDetails] = useState(false);

  const [apiUrl, setApiUrl] = useState('https://api.evolution.petsanny.com');
  const [instanceName, setInstanceName] = useState('clinica-petsanny-sp');
  const [apiKey, setApiKey] = useState('evo_token_secret_99882233');

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
    return <Smile className="w-3.5 h-3.5 text-stone-500" />;
  };

  // Simula pareamento do QR Code com confetes
  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsConnected(true);
      setIsQrModalOpen(false);
      addToast('WhatsApp Conectado!', 'A leitura do QR Code foi confirmada. O canal está pronto para automações.', 'success');
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.error(e);
      }
    }, 1200);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    addToast('WhatsApp Desconectado', 'O canal de WhatsApp foi desconectado temporariamente.', 'warning');
  };

  const handleReset = () => {
    setIsConnected(false);
    setConnectedPhone('5521981062423');
    addToast('Instância Resetada', 'A sessão do WhatsApp foi reinicializada. Por favor, leia o QR Code novamente.', 'info');
    setIsQrModalOpen(true);
  };

  return (
    <div className="space-y-8 text-xs text-stone-850 dark:text-stone-150 animate-fade-in">
      
      {/* SEÇÃO DE CONEXÃO DO WHATSAPP (ESTILO AGENTIVE - SEGUNDA FOTO) */}
      <div className="space-y-6 bg-white dark:bg-stone-900/90 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
        
        {/* Cabeçalho de Conexões + Mini Cards Superiores */}
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 pb-6 border-b border-stone-150 dark:border-stone-800">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 block mb-1">CONEXÕES</span>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">WhatsApp</h2>
              {isConnected ? (
                <>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Conectado
                  </span>
                  <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-semibold text-[11px] border border-stone-200 dark:border-stone-700">
                    WhatsApp conectado
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-[11px] border border-rose-500/20">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Desconectado
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 font-medium max-w-xl">
              Conecte e monitore o WhatsApp usado pelos atendimentos, follow-ups e automações da clínica.
            </p>
          </div>

          {/* Mini Cards no Canto Superior Direito (Status, Canal e WhatsApp) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full xl:w-auto">
            {/* Status Card */}
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                <span>STATUS</span>
                <Activity className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <div className="font-extrabold text-stone-800 dark:text-stone-100 text-xs truncate">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </div>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                {isConnected ? 'Pronto para atender e disparar' : 'Aguardando pareamento'}
              </p>
            </div>

            {/* Canal Card */}
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                <span>CANAL</span>
                <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <div className="font-extrabold text-stone-800 dark:text-stone-100 text-xs truncate">
                {isConnected ? 'WhatsApp conectado' : 'Pendente QR Code'}
              </div>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                Ativo para {currentTenant.name}
              </p>
            </div>

            {/* WhatsApp Card */}
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                <span>WHATSAPP</span>
                <Wifi className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <div className="font-extrabold text-stone-800 dark:text-stone-100 text-xs font-mono truncate">
                {isConnected ? connectedPhone : 'Sem número'}
              </div>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                {isConnected ? connectedPhone : 'Inativo'}
              </p>
            </div>
          </div>
        </div>

        {/* Grid Principal: Canal Ativo (Esquerda) vs Operação (Direita) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Painel Esquerdo: Canal Ativo & Conexão Pronta */}
          <div className="lg:col-span-7 space-y-5">
            {/* Card do Canal Ativo */}
            <div className="p-5 rounded-2xl bg-stone-50/70 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-stone-900 dark:bg-stone-800 text-white flex items-center justify-center font-bold text-lg border border-stone-700 shadow-md shrink-0">
                    <User className="w-7 h-7 text-emerald-400" />
                  </div>
                  {isConnected && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-stone-900" />
                  )}
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 block mb-0.5">CANAL ATIVO</span>
                  <h3 className="text-base font-black text-stone-900 dark:text-stone-100">{connectedUser}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-800">
                      <Smartphone className="w-3 h-3 text-stone-400" /> {connectedPhone}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      <MessageSquare className="w-3 h-3" /> WhatsApp
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner de Status de Conexão (Verde quando ativo / Amarelo quando inativo) */}
            {isConnected ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-emerald-900 dark:text-emerald-200">Conexão pronta</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                    O canal está disponível para conversas, confirmações automáticas de agenda e follow-ups.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-amber-900 dark:text-amber-200">Aguardando Conexão via QR Code</h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    Abra o WhatsApp no seu celular e leia o QR Code para ativar os disparos automáticos.
                  </p>
                </div>
              </div>
            )}

            {/* Configurações Avançadas da Evolution API (Recolhível) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowConfigDetails(!showConfigDetails)}
                className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showConfigDetails ? 'Ocultar Parâmetros da API' : 'Exibir Parâmetros da Evolution API'}</span>
              </button>

              {showConfigDetails && (
                <div className="mt-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Servidor API</label>
                    <input
                      type="text"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-800 dark:text-stone-200 outline-none focus:border-olive-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Nome Instância</label>
                    <input
                      type="text"
                      value={instanceName}
                      onChange={(e) => setInstanceName(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-800 dark:text-stone-200 outline-none focus:border-olive-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">API Key / Token</label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-800 dark:text-stone-200 outline-none focus:border-olive-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Painel Direito: Operação (Checklist de Conexão + Ações) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-stone-50/70 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-800 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 block mb-0.5">OPERAÇÃO</span>
                  <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100">WhatsApp atual</h4>
                </div>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    🟢 Conectado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    🔴 Inativo
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                As ações abaixo afetam a conexão com o número <strong className="font-mono text-stone-800 dark:text-stone-200">{connectedPhone}</strong>.
              </p>

              {/* Checklist de Etapas de Conexão (Estilo Segunda Foto) */}
              <div className="space-y-2.5 pt-2">
                <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isConnected ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-stone-200 text-stone-500'}`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-stone-800 dark:text-stone-200 text-xs">Configurar WhatsApp</div>
                      <div className="text-[10px] text-stone-400 font-mono">{connectedPhone}</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isConnected ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-stone-200 text-stone-500'}`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-stone-800 dark:text-stone-200 text-xs">Parear no celular</div>
                      <div className="text-[10px] text-stone-400">{isConnected ? 'Leitura confirmada via QR Code' : 'Pendente leitura'}</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isConnected ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-stone-200 text-stone-500'}`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-stone-800 dark:text-stone-200 text-xs">Liberar operação</div>
                      <div className="text-[10px] text-stone-400">Chat e automações ativos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações (Botões Principais) */}
            <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
              <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 block mb-2">AÇÕES DE CONEXÃO</span>
              
              {/* Botão Conectar via QR Code / Atualizar */}
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-extrabold text-xs transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>{isConnected ? 'Atualizar este WhatsApp (QR Code)' : 'Conectar WhatsApp via QR Code'}</span>
              </button>

              {/* Botão Desconectar */}
              {isConnected && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs transition-all cursor-pointer border border-amber-500/30 flex items-center justify-center gap-2"
                >
                  <Power className="w-4 h-4" />
                  <span>Desconectar este WhatsApp</span>
                </button>
              )}

              {/* Botão Resetar */}
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs transition-all cursor-pointer border border-rose-500/30 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Resetar este WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO DE FLUXOS DE AUTOMAÇÃO E GATILHOS */}
      <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-extrabold text-stone-800 dark:text-stone-100 text-sm leading-tight">{t(rule.name)}</h4>
                    <p className="text-[10px] text-stone-450 dark:text-stone-400 mt-1">{t(rule.description)}</p>
                  </div>
                  
                  {/* Interruptor Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      checked={rule.active} 
                      onChange={() => handleToggleRule(rule.id, rule.name)} 
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-stone-600 peer-checked:bg-olive-600" />
                  </label>
                </div>

                <div className="pt-2 border-t border-stone-100 dark:border-stone-850 space-y-2">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-stone-450 dark:text-stone-400 uppercase tracking-wider">
                    <span>GATILHO:</span>
                    <span className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                      {t(rule.trigger)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-stone-450 dark:text-stone-400 uppercase tracking-wider block">AÇÕES EM CADEIA:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {rule.actions.map((actKey, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center gap-1.5 text-[10px] font-semibold bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 px-2.5 py-1 rounded-lg text-stone-700 dark:text-stone-300"
                        >
                          {getActionIcon(t(actKey))}
                          {t(actKey)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DE CONEXÃO VIA QR CODE */}
      {isQrModalOpen && (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-6 text-stone-800 dark:text-stone-100 relative">
            
            {/* Header Modal */}
            <div className="flex items-start justify-between border-b border-stone-150 dark:border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900 dark:text-stone-100">Conectar WhatsApp por QR Code</h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Instância: <strong className="font-mono">{instanceName}</strong></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo Principal do Modal: QR Code + Instruções */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              
              {/* Moldura do QR Code */}
              <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-emerald-500/40 shadow-inner flex flex-col items-center justify-center shrink-0 relative group">
                {/* SVG do QR Code Estilizado */}
                <svg className="w-44 h-44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100" height="100" fill="white" />
                  {/* Canto Sup Esq */}
                  <rect x="5" y="5" width="25" height="25" fill="#0f172a" rx="4" />
                  <rect x="10" y="10" width="15" height="15" fill="white" rx="2" />
                  <rect x="14" y="14" width="7" height="7" fill="#10b981" />

                  {/* Canto Sup Dir */}
                  <rect x="70" y="5" width="25" height="25" fill="#0f172a" rx="4" />
                  <rect x="75" y="10" width="15" height="15" fill="white" rx="2" />
                  <rect x="79" y="14" width="7" height="7" fill="#10b981" />

                  {/* Canto Inf Esq */}
                  <rect x="5" y="70" width="25" height="25" fill="#0f172a" rx="4" />
                  <rect x="10" y="75" width="15" height="15" fill="white" rx="2" />
                  <rect x="14" y="79" width="7" height="7" fill="#10b981" />

                  {/* Padrões Randômicos de QR Code */}
                  <rect x="35" y="8" width="6" height="6" fill="#0f172a" />
                  <rect x="45" y="8" width="6" height="6" fill="#10b981" />
                  <rect x="55" y="8" width="6" height="6" fill="#0f172a" />

                  <rect x="35" y="20" width="6" height="6" fill="#10b981" />
                  <rect x="45" y="20" width="16" height="6" fill="#0f172a" />

                  <rect x="8" y="35" width="6" height="6" fill="#0f172a" />
                  <rect x="20" y="35" width="10" height="6" fill="#10b981" />
                  
                  <rect x="35" y="35" width="30" height="30" fill="#0f172a" rx="6" />
                  <rect x="70" y="35" width="10" height="10" fill="#10b981" />
                  <rect x="85" y="35" width="6" height="12" fill="#0f172a" />

                  <rect x="35" y="70" width="8" height="20" fill="#10b981" />
                  <rect x="50" y="70" width="16" height="8" fill="#0f172a" />
                  <rect x="70" y="70" width="20" height="20" fill="#0f172a" rx="4" />

                  {/* Logotipo Central do WhatsApp */}
                  <circle cx="50" cy="50" r="12" fill="#10b981" />
                  <path d="M45 46 C45 44 55 44 55 46 C55 52 47 52 50 55" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>

                {/* Laser de Escaneamento Animado */}
                <div className="absolute inset-x-2 top-2 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-lg shadow-emerald-500 animate-pulse" />
              </div>

              {/* Instruções Passo a Passo */}
              <div className="space-y-3 flex-1 text-xs">
                <h4 className="font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  Como parear com seu celular:
                </h4>
                <ol className="space-y-2 text-stone-600 dark:text-stone-300 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span>Abra o <strong>WhatsApp</strong> no seu smartphone.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span>Acesse <strong>Menu (⋮)</strong> ou <strong>Configurações (⚙️)</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span>Toque em <strong>Dispositivos conectados</strong> e depois em <strong>Conectar um dispositivo</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                    <span>Aponte a câmera para esta tela para capturar o código.</span>
                  </li>
                </ol>
              </div>
            </div>

            {/* Footer do Modal com Botão de Teste de Leitura */}
            <div className="pt-4 border-t border-stone-150 dark:border-stone-800 flex items-center justify-between gap-3">
              <span className="text-[11px] text-stone-400 font-medium flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                Aguardando leitura do QR Code...
              </span>
              <button
                type="button"
                onClick={handleSimulateScan}
                disabled={isScanning}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Confirmando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Simular Leitura do QR Code</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
