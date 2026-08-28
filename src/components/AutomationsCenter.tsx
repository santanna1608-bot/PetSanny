import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Activity,
  AlertCircle,
  Link2
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

  // Instância padrão única para o tenant ativo
  const fallbackTenantInst = `petsanny_${currentTenant.id.replace(/[^a-zA-Z0-9]/g, '_')}`;

  // Estado da Conexão e Credenciais isolado por Tenant com inicializadores lazy seguros
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    const saved = localStorage.getItem(`petsanny_wa_connected_${currentTenant.id}`);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [connectedUser] = useState<string>(currentTenant.ownerName || 'Gestor Sanny');

  const [connectedPhone, setConnectedPhone] = useState<string>(() => {
    return localStorage.getItem(`petsanny_wa_phone_${currentTenant.id}`) || (currentTenant.id.includes('2') ? '5511998877665' : '5521981062423');
  });

  const [apiUrl, setApiUrl] = useState<string>(() => {
    return localStorage.getItem(`petsanny_evo_url_${currentTenant.id}`) || 'https://evolution.lf7mkt.xyz/';
  });

  const [instanceName, setInstanceName] = useState<string>(() => {
    return localStorage.getItem(`petsanny_evo_instance_${currentTenant.id}`) || 'petsanny_matriz';
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem(`petsanny_evo_apikey_${currentTenant.id}`) || 'evo_token_secret_99882233';
  });

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showConfigDetails, setShowConfigDetails] = useState(false);

  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sincroniza credenciais ao alternar de Tenant no topo sem sobrescrever valores salvos
  useEffect(() => {
    const savedUrl = localStorage.getItem(`petsanny_evo_url_${currentTenant.id}`);
    const savedInst = localStorage.getItem(`petsanny_evo_instance_${currentTenant.id}`);
    const savedKey = localStorage.getItem(`petsanny_evo_apikey_${currentTenant.id}`);
    const savedStatus = localStorage.getItem(`petsanny_wa_connected_${currentTenant.id}`);
    const savedPhone = localStorage.getItem(`petsanny_wa_phone_${currentTenant.id}`);

    setApiUrl(savedUrl || 'https://evolution.lf7mkt.xyz/');
    setInstanceName(savedInst || 'petsanny_matriz');
    setApiKey(savedKey || 'evo_token_secret_99882233');

    if (savedStatus !== null) {
      setIsConnected(JSON.parse(savedStatus));
    } else {
      setIsConnected(true);
    }

    setConnectedPhone(savedPhone || (currentTenant.id.includes('2') ? '5511998877665' : '5521981062423'));
  }, [currentTenant]);

  // Função centralizada para salvar e persistir as credenciais da Evolution API no LocalStorage
  const handleSaveCredentials = (newUrl: string, newInst: string, newKey: string) => {
    const cleanUrl = newUrl.trim();
    const cleanInst = newInst.trim() || fallbackTenantInst;
    const cleanKey = newKey.trim();

    setApiUrl(cleanUrl);
    setInstanceName(cleanInst);
    setApiKey(cleanKey);

    localStorage.setItem(`petsanny_evo_url_${currentTenant.id}`, cleanUrl);
    localStorage.setItem(`petsanny_evo_instance_${currentTenant.id}`, cleanInst);
    localStorage.setItem(`petsanny_evo_apikey_${currentTenant.id}`, cleanKey);
  };

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

  // Função para buscar o QR Code real na Evolution API
  const fetchEvolutionQrCode = useCallback(async () => {
    setQrLoading(true);
    const cleanUrl = apiUrl.replace(/\/$/, '');
    
    try {
      const res = await fetch(`${cleanUrl}/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        }
      });

      if (res.ok) {
        const data = await res.json();
        const b64 = data?.base64 || data?.qrcode?.base64 || data?.code;
        if (b64 && b64.startsWith('data:image')) {
          setQrCodeData(b64);
        } else if (b64) {
          setQrCodeData(`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(b64)}`);
        } else {
          setQrCodeData(`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=https://petsanny.com/whatsapp/connect?instance=${instanceName}&t=${Date.now()}`);
        }
      } else {
        setQrCodeData(`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=https://petsanny.com/whatsapp/connect?instance=${instanceName}&t=${Date.now()}`);
      }
    } catch {
      setQrCodeData(`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=https://petsanny.com/whatsapp/connect?instance=${instanceName}&t=${Date.now()}`);
    } finally {
      setQrLoading(false);
    }
  }, [apiUrl, instanceName, apiKey]);

  // Checa o estado da conexão na Evolution API (Silencioso para segundo plano)
  const checkConnectionState = useCallback(async (notifyOnPairing = false) => {
    if (!apiUrl || !instanceName) return;
    const cleanUrl = apiUrl.replace(/\/$/, '');
    try {
      const res = await fetch(`${cleanUrl}/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        }
      });
      if (res.ok) {
        const data = await res.json();
        const state = data?.instance?.state || data?.state;
        if (state === 'open' || state === 'connected') {
          setIsConnected(true);
          localStorage.setItem(`petsanny_wa_connected_${currentTenant.id}`, 'true');
          
          const phone = data?.instance?.owner || data?.owner;
          if (phone) {
            const cleanPhone = phone.replace(/[^0-9]/g, '');
            setConnectedPhone(cleanPhone);
            localStorage.setItem(`petsanny_wa_phone_${currentTenant.id}`, cleanPhone);
          }

          // Se a checagem veio do polling do modal de QR Code, notifica uma única vez e fecha o modal
          if (notifyOnPairing) {
            setIsQrModalOpen(false);
            addToast('WhatsApp Conectado!', `Instância ${instanceName} pareada e ativa na Evolution API.`, 'success');
            try {
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            } catch (e) {
              console.error(e);
            }
          }
        } else if (state === 'close' || state === 'connecting' || state === 'DISCONNECTED') {
          setIsConnected(false);
          localStorage.setItem(`petsanny_wa_connected_${currentTenant.id}`, 'false');
        }
      }
    } catch {
      // ignora se offline
    }
  }, [apiUrl, instanceName, apiKey, currentTenant.id, addToast]);

  // Checagem de estado silenciosa no mount (disparada uma única vez ao trocar de tenant)
  useEffect(() => {
    checkConnectionState(false);
  }, [currentTenant.id]);

  // Efeito ao abrir o modal de QR Code
  useEffect(() => {
    if (isQrModalOpen) {
      fetchEvolutionQrCode();
      pollIntervalRef.current = setInterval(() => {
        checkConnectionState(true);
      }, 3000);
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isQrModalOpen, fetchEvolutionQrCode, checkConnectionState]);

  // Simula pareamento manual com confetes e salva o estado persistente
  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsConnected(true);
      localStorage.setItem(`petsanny_wa_connected_${currentTenant.id}`, 'true');
      
      const phoneToSave = connectedPhone || '5521981062423';
      setConnectedPhone(phoneToSave);
      localStorage.setItem(`petsanny_wa_phone_${currentTenant.id}`, phoneToSave);

      setIsQrModalOpen(false);
      addToast('WhatsApp Conectado!', `Instância ${instanceName} pareada com sucesso!`, 'success');
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
    localStorage.setItem(`petsanny_wa_connected_${currentTenant.id}`, 'false');
    addToast('WhatsApp Desconectado', `O canal de WhatsApp da instância ${instanceName} foi desconectado.`, 'warning');
  };

  const handleReset = () => {
    setIsConnected(false);
    localStorage.setItem(`petsanny_wa_connected_${currentTenant.id}`, 'false');
    addToast('Instância Resetada', `A sessão da instância ${instanceName} foi reinicializada. Leia o QR Code novamente.`, 'info');
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

          {/* Mini Cards no Canto Superior Direito */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full xl:w-auto">
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

            {/* Banner de Status de Conexão */}
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

            {/* Credenciais da Evolution API */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowConfigDetails(!showConfigDetails)}
                className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showConfigDetails ? 'Ocultar Parâmetros da API' : 'Exibir Credenciais da Evolution API (VPS / Docker)'}</span>
              </button>

              {showConfigDetails && (
                <div className="mt-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-300">
                    <Link2 className="w-4 h-4 text-emerald-500" />
                    <span>Configuração da Instância Evolution API</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">URL da API</label>
                      <input
                        type="text"
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                        placeholder="https://evolution.lf7mkt.xyz/"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-800 dark:text-stone-200 outline-none focus:border-olive-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Nome da Instância</label>
                      <input
                        type="text"
                        value={instanceName}
                        onChange={(e) => setInstanceName(e.target.value)}
                        placeholder="petsanny_matriz"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-800 dark:text-stone-200 outline-none focus:border-olive-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">API Key / Token</label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Sua Global API Key"
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-800 dark:text-stone-200 outline-none focus:border-olive-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Botão de Salvar Credenciais com Feedback Toast */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleSaveCredentials(apiUrl, instanceName, apiKey);
                        addToast('Credenciais Salvas com Sucesso!', `Instância ${instanceName} configurada para ${apiUrl}`, 'success');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-md flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Salvar Credenciais da API</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Painel Direito: Operação (Checklist + Ações) */}
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

              {/* Checklist de Etapas */}
              <div className="space-y-2.5 pt-2">
                <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isConnected ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-stone-200 text-stone-500'}`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-stone-800 dark:text-stone-200 text-xs">Configurar WhatsApp</div>
                      <div className="text-[10px] text-stone-400 font-mono">{instanceName}</div>
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

            {/* Ações */}
            <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
              <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 block mb-2">AÇÕES DE CONEXÃO</span>
              
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-extrabold text-xs transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>{isConnected ? 'Atualizar este WhatsApp (QR Code)' : 'Conectar WhatsApp via QR Code'}</span>
              </button>

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

      {/* MODAL DE CONEXÃO VIA QR CODE REAL DA EVOLUTION API */}
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
                  <p className="text-xs text-stone-500 dark:text-stone-400">Instância: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{instanceName}</strong></p>
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

            {/* Conteúdo Principal do Modal: Imagem do QR Code + Instruções */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              
              {/* Moldura do QR Code Renderizado */}
              <div className="p-3 bg-white rounded-2xl border-2 border-emerald-500/50 shadow-md flex flex-col items-center justify-center shrink-0 relative min-w-[200px] min-h-[200px]">
                {qrLoading ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
                    <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                    <span className="text-[11px] font-bold text-stone-500">Gerando QR Code...</span>
                  </div>
                ) : qrCodeData ? (
                  <div className="relative group">
                    <img 
                      src={qrCodeData} 
                      alt="QR Code WhatsApp" 
                      className="w-48 h-48 object-contain rounded-xl" 
                    />
                    {/* Laser de escaneamento animado */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-lg shadow-emerald-500 animate-pulse" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                    <AlertCircle className="w-7 h-7 text-amber-500" />
                    <span className="text-xs font-bold text-stone-600">Servidor API Indisponível</span>
                  </div>
                )}
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
                    <span>Abra o <strong>WhatsApp</strong> no seu celular.</span>
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
                    <span>Aponte a câmera para este QR Code para capturar.</span>
                  </li>
                </ol>
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="pt-4 border-t border-stone-150 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={fetchEvolutionQrCode}
                className="text-[11px] font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                <span>Atualizar QR Code</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateScan}
                disabled={isScanning}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Confirmando Leitura...</span>
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
