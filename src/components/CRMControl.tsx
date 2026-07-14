import React, { useState, useEffect } from 'react';
import { useAppointments } from '../contexts/AppointmentsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { tutorsService, petsService } from '../lib/supabaseClient';
import type { Tutor } from '../lib/supabaseClient';
import { 
  Send, 
  CheckCheck, 
  FileText, 
  Image as ImageIcon, 
  Sparkles, 
  TrendingUp,
  Percent,
  UserCheck,
  Zap
} from 'lucide-react';

interface PipelineLead {
  tutorId: string;
  tutorName: string;
  stage: 'lead' | 'first_contact' | 'first_consult' | 'active' | 'treatment' | 'return_pending' | 'inactive' | 'vip';
}

interface ChatMessage {
  id: string;
  sender: 'tutor' | 'agent';
  text: string;
  time: string;
  attachment?: {
    name: string;
    type: 'pdf' | 'image';
  };
}

export const CRMControl: React.FC = () => {
  const { currentTenant, addToast } = useAppointments();
  const { t } = useLanguage();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [pipeline, setPipeline] = useState<PipelineLead[]>([]);
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  
  // WhatsApp Simulator states
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [inputText, setInputText] = useState('');
  
  // Métricas do CRM
  const [sentCount, setSentCount] = useState(148);
  const [deliveredCount, setDeliveredCount] = useState(142);
  const [readCount, setReadCount] = useState(115);
  const [replyCount, setReplyCount] = useState(62);
  const [conversionRate, setConversionRate] = useState(41.8);
  const [revenueGenerated, setRevenueGenerated] = useState(2450.00);

  // Carrega Tutores e Inicializa o Pipeline / Mensagens
  useEffect(() => {
    const loadCRMData = async () => {
      try {
        const list = await tutorsService.list(currentTenant.id);
        setTutors(list);

        // Inicializa o Pipeline dos tutores do tenant
        const cacheKey = `petsanny_crm_pipeline_${currentTenant.id}`;
        const cachedPipeline = localStorage.getItem(cacheKey);

        if (cachedPipeline) {
          setPipeline(JSON.parse(cachedPipeline));
        } else {
          const defaultPipeline: PipelineLead[] = list.map((t, index) => {
            const stages: PipelineLead['stage'][] = ['lead', 'first_contact', 'active', 'vip'];
            return {
              tutorId: t.id,
              tutorName: t.name,
              stage: stages[index % stages.length]
            };
          });
          setPipeline(defaultPipeline);
          savePipelineToStorage(defaultPipeline);
        }

        // Inicializa conversas padrão no WhatsApp
        const chatKey = `petsanny_crm_chats_${currentTenant.id}`;
        const cachedChats = localStorage.getItem(chatKey);

        if (cachedChats) {
          const parsed = JSON.parse(cachedChats);
          // Se for cache antigo com strings em português fixas, força migração
          const firstChatId = Object.keys(parsed)[0];
          if (firstChatId && parsed[firstChatId].length > 0 && parsed[firstChatId][0].text.startsWith('Olá,')) {
            const initialChats: Record<string, ChatMessage[]> = {};
            list.forEach(tut => {
              initialChats[tut.id] = [
                { id: '1', sender: 'agent', text: 'crm.chat.welcome', time: '09:15' },
                { id: '2', sender: 'tutor', text: 'crm.chat.tutor_reply', time: '09:20' }
              ];
            });
            setMessages(initialChats);
            saveChatsToStorage(initialChats);
          } else {
            setMessages(parsed);
          }
        } else {
          const initialChats: Record<string, ChatMessage[]> = {};
          list.forEach(tut => {
            initialChats[tut.id] = [
              { id: '1', sender: 'agent', text: 'crm.chat.welcome', time: '09:15' },
              { id: '2', sender: 'tutor', text: 'crm.chat.tutor_reply', time: '09:20' }
            ];
          });
          setMessages(initialChats);
          saveChatsToStorage(initialChats);
        }

        if (list.length > 0) {
          setSelectedTutorId(list[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadCRMData();
  }, [currentTenant]);

  const handleGenerateDemoTutors = async () => {
    try {
      // Cria 3 tutores de teste para o tenant atual
      const t1 = await tutorsService.create({ tenant_id: currentTenant.id, name: 'Ana Souza', email: 'ana.souza@gmail.com', phone: '(11) 98888-7777' });
      const t2 = await tutorsService.create({ tenant_id: currentTenant.id, name: 'Bruno Lima', email: 'bruno.lima@outlook.com', phone: '(11) 97777-6666' });
      const t3 = await tutorsService.create({ tenant_id: currentTenant.id, name: 'Eliana Costa', email: 'eliana.costa@hotmail.com', phone: '(21) 96666-5555' });
      
      // Cria os pets correspondentes no banco
      await petsService.create({ tenant_id: currentTenant.id, tutor_id: t1.id, name: 'Toby', species: 'Cão (Golden Retriever)', breed: 'Golden Retriever', birth_date: '2021-05-10' });
      await petsService.create({ tenant_id: currentTenant.id, tutor_id: t2.id, name: 'Mel', species: 'Cão (Lhasa Apso)', breed: 'Lhasa Apso', birth_date: '2023-01-15' });
      await petsService.create({ tenant_id: currentTenant.id, tutor_id: t3.id, name: 'Luna', species: 'Gata (SRD)', breed: 'SRD', birth_date: '2020-08-20' });

      addToast(t('crm.toast_demo_created_title'), t('crm.toast_demo_created_desc'), 'success');
      
      // Recarrega os dados do CRM
      const newList = await tutorsService.list(currentTenant.id);
      setTutors(newList);
      
      const defaultPipeline: PipelineLead[] = newList.map((t, index) => {
        const stages: PipelineLead['stage'][] = ['lead', 'first_contact', 'active', 'vip'];
        return {
          tutorId: t.id,
          tutorName: t.name,
          stage: stages[index % stages.length]
        };
      });
      setPipeline(defaultPipeline);
      savePipelineToStorage(defaultPipeline);
      
      const initialChats: Record<string, ChatMessage[]> = {};
      newList.forEach(tut => {
        initialChats[tut.id] = [
          { id: '1', sender: 'agent', text: 'crm.chat.welcome', time: '09:15' },
          { id: '2', sender: 'tutor', text: 'crm.chat.tutor_reply', time: '09:20' }
        ];
      });
      setMessages(initialChats);
      saveChatsToStorage(initialChats);
      
      if (newList.length > 0) {
        setSelectedTutorId(newList[0].id);
      }
    } catch (err) {
      console.error(err);
      addToast('Erro', 'Não foi possível gerar dados de demonstração.', 'warning');
    }
  };

  const savePipelineToStorage = (updatedPipeline: PipelineLead[]) => {
    localStorage.setItem(`petsanny_crm_pipeline_${currentTenant.id}`, JSON.stringify(updatedPipeline));
  };

  const saveChatsToStorage = (updatedChats: Record<string, ChatMessage[]>) => {
    localStorage.setItem(`petsanny_crm_chats_${currentTenant.id}`, JSON.stringify(updatedChats));
  };

  // Mover lead no Pipeline
  const handleMoveStage = (tutorId: string, newStage: PipelineLead['stage']) => {
    const updated = pipeline.map(p => p.tutorId === tutorId ? { ...p, stage: newStage } : p);
    setPipeline(updated);
    savePipelineToStorage(updated);
    addToast(t('crm.toast_pipe_title'), t('crm.toast_pipe_desc'), 'info');
  };

  // Enviar Mensagem no WhatsApp
  const handleSendMessage = (e?: React.FormEvent, customText?: string, attachment?: ChatMessage['attachment']) => {
    if (e) e.preventDefault();
    if (!selectedTutorId) return;

    const textToSend = customText || inputText;
    if (!textToSend && !attachment) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'agent',
      text: textToSend,
      time: timeStr,
      attachment
    };

    const updatedTutorMessages = [...(messages[selectedTutorId] || []), newMsg];
    const newChats = {
      ...messages,
      [selectedTutorId]: updatedTutorMessages
    };

    setMessages(newChats);
    saveChatsToStorage(newChats);
    setInputText('');
    
    // Atualiza estatísticas locais
    setSentCount(prev => prev + 1);

    // Simula resposta automática do tutor após 1.5 segundos
    setTimeout(() => {
      const tutorReply: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'tutor',
        text: 'crm.chat.auto_reply',
        time: timeStr
      };
      
      const replyChats = {
        ...newChats,
        [selectedTutorId]: [...updatedTutorMessages, tutorReply]
      };
      
      setMessages(replyChats);
      saveChatsToStorage(replyChats);
      setDeliveredCount(prev => prev + 1);
      setReadCount(prev => prev + 1);
      setReplyCount(prev => prev + 1);
      setConversionRate(prev => Math.min(parseFloat((prev + 0.3).toFixed(1)), 100));
      setRevenueGenerated(prev => prev + 120.00);
      
      addToast(t('crm.toast_msg_title'), t('crm.toast_msg_desc'), 'success');
    }, 1800);
  };

  // Enviar Arquivos Rápidos
  const handleSendFile = (type: 'pdf' | 'image') => {
    const fileName = type === 'pdf' ? 'Receita_Veterinaria_Digital.pdf' : 'Comprovante_Agendamento.png';
    handleSendMessage(undefined, t('crm.chat.file_sent').replace('{name}', fileName), { name: fileName, type });
  };

  // Gatilhos de Automação Rápida
  const handleTriggerCampaign = (campaignType: string) => {
    if (!selectedTutorId) return;
    const tutor = tutors.find(t => t.id === selectedTutorId);
    if (!tutor) return;

    let text = '';
    switch (campaignType) {
      case 'confirm':
        text = 'crm.chat.camp_confirm';
        break;
      case 'vaccine':
        text = 'crm.chat.camp_vaccine';
        break;
      case 'promo':
        text = 'crm.chat.camp_promo';
        break;
    }
    
    handleSendMessage(undefined, text);
    addToast(t('crm.toast_camp_title'), t('crm.toast_camp_desc').replace('{type}', t(`crm.btn_${campaignType === 'confirm' ? 'reminder' : campaignType}`)), 'success');
  };

  const getWhatsAppLink = (text: string = '') => {
    if (!selectedTutorId) return '#';
    const tutor = tutors.find(t => t.id === selectedTutorId);
    if (!tutor || !tutor.phone) return '#';
    const cleanPhone = tutor.phone.replace(/\D/g, '');
    // Se o telefone não começar com o código do país, assume 55 (Brasil)
    const formattedPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    
    // Resolve chaves de tradução dinâmicas antes de enviar para o WhatsApp real
    let resolvedText = text;
    if (text.startsWith('crm.chat.')) {
      resolvedText = t(text).replace('{name}', tutor.name);
    }
    
    return `https://api.whatsapp.com/send?phone=${formattedPhone}${resolvedText ? `&text=${encodeURIComponent(resolvedText)}` : ''}`;
  };

  const getStageLabel = (stage: PipelineLead['stage']) => {
    switch (stage) {
      case 'lead': return t('crm.stage.lead');
      case 'first_contact': return t('crm.stage.first_contact');
      case 'first_consult': return t('crm.stage.first_consult');
      case 'active': return t('crm.stage.active');
      case 'treatment': return t('crm.stage.treatment');
      case 'return_pending': return t('crm.stage.return_pending');
      case 'inactive': return t('crm.stage.inactive');
      case 'vip': return t('crm.stage.vip');
    }
  };

  const stagesList: PipelineLead['stage'][] = [
    'lead',
    'first_contact',
    'first_consult',
    'active',
    'treatment',
    'return_pending',
    'inactive',
    'vip'
  ];

  return (
    <div className="space-y-6 text-xs text-stone-850 dark:text-stone-150 animate-fade-in">
      
      {/* 1. Painel de Indicadores de Desempenho do CRM */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-xl shadow-xs">
          <span className="text-[9px] text-stone-500 dark:text-stone-400 font-bold uppercase block mb-1">{t('crm.stats_sent')}</span>
          <span className="text-lg font-black text-stone-800 dark:text-stone-100">{sentCount}</span>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-xl shadow-xs">
          <span className="text-[9px] text-stone-500 dark:text-stone-400 font-bold uppercase block mb-1">{t('crm.stats_delivered')}</span>
          <span className="text-lg font-black text-stone-800 dark:text-stone-100">{deliveredCount}</span>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-xl shadow-xs">
          <span className="text-[9px] text-stone-500 dark:text-stone-400 font-bold uppercase block mb-1">{t('crm.stats_read')}</span>
          <span className="text-lg font-black text-stone-800 dark:text-stone-100">{readCount}</span>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-xl shadow-xs">
          <span className="text-[9px] text-stone-500 dark:text-stone-400 font-bold uppercase block mb-1">{t('crm.stats_replied')}</span>
          <span className="text-lg font-black text-stone-800 dark:text-stone-100">{replyCount}</span>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[9px] text-stone-500 dark:text-stone-400 font-bold uppercase block mb-1">{t('crm.stats_conversion')}</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-450">{conversionRate}%</span>
          </div>
          <Percent className="w-5 h-5 text-emerald-500 opacity-60" />
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200/85 dark:border-stone-800 p-4 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[9px] text-stone-500 dark:text-stone-400 font-bold uppercase block mb-1">{t('crm.stats_revenue')}</span>
            <span className="text-lg font-black text-olive-650 dark:text-olive-400">R$ {revenueGenerated.toFixed(0)}</span>
          </div>
          <TrendingUp className="w-5 h-5 text-olive-500 opacity-60" />
        </div>
      </div>

      {/* 2. Grid Principal: Pipeline + Simulador WhatsApp */}
      {tutors.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 text-center space-y-5 animate-fade-in flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-olive-500/10 dark:bg-olive-950/40 text-olive-650 dark:text-olive-400 flex items-center justify-center mb-2 shadow-inner">
            <UserCheck className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-2">
            <h4 className="font-extrabold text-base text-stone-800 dark:text-stone-100">{t('crm.empty_title')}</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
              {t('crm.empty_desc')}
            </p>
          </div>
          <button
            onClick={handleGenerateDemoTutors}
            className="inline-flex items-center gap-2 bg-olive-600 hover:bg-olive-750 text-white font-extrabold px-5 py-3 rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-all scale-100 hover:scale-102 active:scale-98 text-xs shrink-0"
          >
            <Sparkles className="w-4 h-4 text-emerald-350" />
            <span>{t('crm.empty_button')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Pipeline Kanban Slim */}
          <div className="xl:col-span-1 bg-white dark:bg-stone-900 rounded-2xl border border-stone-205 dark:border-stone-850 p-5 space-y-4">
          <h4 className="font-extrabold text-sm text-stone-800 dark:text-stone-100 flex items-center gap-1.5 pb-3 border-b border-stone-150 dark:border-stone-800">
            <UserCheck className="w-4 h-4 text-olive-600" />
            {t('crm.pipeline_title')}
          </h4>
 
          <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
            {pipeline.map((lead) => (
              <div 
                key={lead.tutorId}
                className={`p-3 border rounded-xl transition-all space-y-2.5 ${
                  selectedTutorId === lead.tutorId 
                    ? 'border-olive-500 bg-olive-500/5' 
                    : 'border-stone-150 dark:border-stone-800 bg-stone-50/20 hover:bg-stone-50/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span 
                    onClick={() => setSelectedTutorId(lead.tutorId)}
                    className="font-bold text-stone-800 dark:text-stone-200 cursor-pointer hover:underline"
                  >
                    {lead.tutorName}
                  </span>
                  <span className="text-[8px] bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-extrabold px-2 py-0.5 rounded-full border dark:border-stone-750">
                    {t('crm.stage_label')}
                  </span>
                </div>
                
                {/* Seletor de Estágio Rápido */}
                <div className="relative">
                  <select
                    value={lead.stage}
                    onChange={(e) => handleMoveStage(lead.tutorId, e.target.value as any)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 text-stone-800 dark:text-stone-100 rounded-lg p-2 font-semibold text-[10px] cursor-pointer"
                  >
                    {stagesList.map(stG => (
                      <option key={stG} value={stG}>
                        {getStageLabel(stG)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Simulador */}
        <div className="xl:col-span-2 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col h-[550px]">
          
          {/* Header do WhatsApp */}
          <div className="p-4 bg-stone-50 dark:bg-stone-955 border-b border-stone-150 dark:border-stone-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-olive-500/10 dark:bg-olive-950 text-olive-650 dark:text-olive-400 flex items-center justify-center font-bold border dark:border-stone-850 shadow-inner">
                {selectedTutorId ? tutors.find(t => t.id === selectedTutorId)?.name[0].toUpperCase() : 'W'}
              </div>
              <div>
                <h5 className="font-extrabold text-stone-855 dark:text-stone-100 leading-tight">
                  {selectedTutorId ? tutors.find(t => t.id === selectedTutorId)?.name : t('crm.select_tutor')}
                </h5>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-stone-450 dark:text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    {t('crm.sim_active')}
                  </span>
                  {selectedTutorId && tutors.find(t => t.id === selectedTutorId)?.phone && (
                    <a
                      href={getWhatsAppLink(t('crm.chat.welcome_short'))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[8.5px] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-1.5 py-0.5 rounded-md shadow-xs cursor-pointer transition-all hover:scale-103 leading-none"
                      title="Abrir WhatsApp Oficial"
                    >
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.634-1.023-5.11-2.885-6.974C16.526 1.909 14.053.886 11.419.887 5.985.887 1.56 5.308 1.556 10.746c-.002 1.776.467 3.511 1.358 5.044l-1.015 3.707 3.792-.993z"/>
                      </svg>
                      <span>WhatsApp Real</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
 
            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => handleTriggerCampaign('confirm')}
                className="inline-flex items-center gap-1 text-[9px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-olive-550 font-extrabold px-2.5 py-1.5 rounded-lg text-stone-600 dark:text-stone-300 cursor-pointer whitespace-nowrap"
              >
                <CheckCheck className="w-3 h-3 text-emerald-500" />
                {t('crm.btn_reminder')}
              </button>
              <button
                onClick={() => handleTriggerCampaign('vaccine')}
                className="inline-flex items-center gap-1 text-[9px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-olive-550 font-extrabold px-2.5 py-1.5 rounded-lg text-stone-600 dark:text-stone-300 cursor-pointer whitespace-nowrap"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                {t('crm.btn_vaccine')}
              </button>
              <button
                onClick={() => handleTriggerCampaign('promo')}
                className="inline-flex items-center gap-1 text-[9px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-olive-550 font-extrabold px-2.5 py-1.5 rounded-lg text-stone-600 dark:text-stone-300 cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3 text-purple-500" />
                {t('crm.btn_coupon')}
              </button>
            </div>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 p-5 overflow-y-auto bg-stone-50/50 dark:bg-stone-950/20 space-y-3.5">
            {selectedTutorId && (messages[selectedTutorId] || []).map((msg) => {
              const isAgent = msg.sender === 'agent';
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isAgent ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div className={`max-w-[70%] p-3 rounded-2xl shadow-xs space-y-1.5 ${
                    isAgent 
                      ? 'bg-olive-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-stone-850 text-stone-800 dark:text-stone-200 border border-stone-150 dark:border-stone-800 rounded-tl-none'
                  }`}>
                    <p className="text-[11.5px] leading-relaxed font-medium">
                      {msg.text.startsWith('crm.chat.')
                        ? t(msg.text).replace('{name}', tutors.find(t => t.id === selectedTutorId)?.name || 'Tutor')
                        : msg.text}
                    </p>
                    
                    {/* Anexo de Arquivo */}
                    {msg.attachment && (
                      <div className={`p-2 rounded-xl flex items-center justify-between gap-3 ${
                        isAgent ? 'bg-olive-750' : 'bg-stone-100 dark:bg-stone-900'
                      }`}>
                        <div className="flex items-center gap-1.5">
                          {msg.attachment.type === 'pdf' ? <FileText className="w-4 h-4 text-rose-500" /> : <ImageIcon className="w-4 h-4 text-blue-500" />}
                          <span className="text-[9px] font-bold truncate max-w-[120px]">{msg.attachment.name}</span>
                        </div>
                        <button className="text-[8px] font-extrabold uppercase bg-stone-900/10 dark:bg-white/10 hover:bg-stone-900/20 px-2 py-1 rounded">
                          {t('crm.btn_view')}
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-1 text-[8px] opacity-60 leading-none">
                      <span>{msg.time}</span>
                      {isAgent && <CheckCheck className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input de Envio do WhatsApp */}
          <form 
            onSubmit={handleSendMessage}
            className="p-3 bg-stone-50 dark:bg-stone-955 border-t border-stone-150 dark:border-stone-850 flex items-center gap-3 shrink-0"
          >
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSendFile('pdf')}
                className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-850 rounded-lg cursor-pointer"
                title={t('crm.attach_pdf')}
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleSendFile('image')}
                className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-850 rounded-lg cursor-pointer"
                title={t('crm.attach_image')}
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>
             <input
               type="text"
               placeholder={t('crm.input_placeholder')}
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               className="flex-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 outline-none text-xs focus:border-olive-500 text-stone-800 dark:text-stone-100"
             />
             
             <div className="flex items-center gap-1.5">
               <button
                 type="submit"
                 className="p-2.5 bg-olive-600 hover:bg-olive-750 text-white rounded-xl shadow-md cursor-pointer hover:scale-105 transition-all flex items-center justify-center shrink-0"
                 title="Enviar no Simulador"
               >
                 <Send className="w-4 h-4" />
               </button>
 
               {selectedTutorId && tutors.find(t => t.id === selectedTutorId)?.phone && (
                 <a
                   href={getWhatsAppLink(inputText)}
                   target="_blank"
                   rel="noopener noreferrer"
                   onClick={() => {
                     if (inputText.trim()) {
                       const now = new Date();
                       const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                       const newMsg: ChatMessage = {
                         id: Math.random().toString(36).substring(2, 9),
                         sender: 'agent',
                         text: inputText,
                         time: timeStr
                       };
                       const updatedTutorMessages = [...(messages[selectedTutorId] || []), newMsg];
                       const newChats = {
                         ...messages,
                         [selectedTutorId]: updatedTutorMessages
                       };
                       setMessages(newChats);
                       saveChatsToStorage(newChats);
                       setInputText('');
                       setSentCount(prev => prev + 1);
                     }
                   }}
                   className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md cursor-pointer hover:scale-105 transition-all flex items-center justify-center shrink-0"
                   title="Enviar via WhatsApp Real"
                 >
                   <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current animate-pulse-soft" xmlns="http://www.w3.org/2000/svg">
                     <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.634-1.023-5.11-2.885-6.974C16.526 1.909 14.053.886 11.419.887 5.985.887 1.56 5.308 1.556 10.746c-.002 1.776.467 3.511 1.358 5.044l-1.015 3.707 3.792-.993z"/>
                   </svg>
                 </a>
               )}
             </div>
          </form>

        </div>

      </div>
      )}

    </div>
  );
};
