import React, { useState, useEffect } from 'react';
import { useAppointments } from '../contexts/AppointmentsContext';
import { tutorsService, Tutor } from '../lib/supabaseClient';
import { 
  Users, 
  MessageSquare, 
  Send, 
  CheckCheck, 
  FileText, 
  Image as ImageIcon, 
  Sparkles, 
  TrendingUp,
  Percent,
  Play,
  Mail,
  MoreVertical,
  UserCheck,
  Zap,
  ArrowRight,
  Plus
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
          localStorage.setItem(cacheKey, JSON.stringify(defaultPipeline));
        }

        // Inicializa conversas padrão no WhatsApp
        const chatKey = `petsanny_crm_chats_${currentTenant.id}`;
        const cachedChats = localStorage.getItem(chatKey);

        if (cachedChats) {
          setMessages(JSON.parse(cachedChats));
        } else {
          const initialChats: Record<string, ChatMessage[]> = {};
          list.forEach(t => {
            initialChats[t.id] = [
              { id: '1', sender: 'agent', text: `Olá, ${t.name}! Tudo bem com o seu pet? Gostaríamos de lembrar que já faz algum tempo desde a última visita dele conosco. Vamos agendar um retorno?`, time: '09:15' },
              { id: '2', sender: 'tutor', text: 'Oi! Tudo bem sim. Verdade, estava pensando em agendar um banho para este sábado. Vocês têm horário?', time: '09:20' }
            ];
          });
          setMessages(initialChats);
          localStorage.setItem(chatKey, JSON.stringify(initialChats));
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
    addToast('Pipeline Atualizado', 'Estágio do cliente alterado com sucesso.', 'info');
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
        text: 'Perfeito! Obrigado pelo aviso, vou verificar aqui e já te confirmo.',
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
      
      addToast('Nova Mensagem', 'O tutor acabou de responder a sua mensagem.', 'success');
    }, 1800);
  };

  // Enviar Arquivos Rápidos
  const handleSendFile = (type: 'pdf' | 'image') => {
    const fileName = type === 'pdf' ? 'Receita_Veterinaria_Digital.pdf' : 'Comprovante_Agendamento.png';
    handleSendMessage(undefined, `Enviei um arquivo para você: ${fileName}`, { name: fileName, type });
  };

  // Gatilhos de Automação Rápida
  const handleTriggerCampaign = (campaignType: string) => {
    if (!selectedTutorId) return;
    const tutor = tutors.find(t => t.id === selectedTutorId);
    if (!tutor) return;

    let text = '';
    switch (campaignType) {
      case 'confirm':
        text = `Olá, ${tutor.name}! Confirmamos o atendimento do seu pet amanhã na PetSanny às 14h00. Aguardamos vocês!`;
        break;
      case 'vaccine':
        text = `⚠️ Alerta de Saúde PetSanny: A vacina anual do seu pet está vencendo esta semana. Vamos agendar uma consulta preventiva de imunização?`;
        break;
      case 'promo':
        text = `🎉 Cupom Especial PetSanny! Seu pet merece um dia de rei. Use o cupom VIPPET e ganhe 15% de desconto no Banho + Hidratação nesta semana.`;
        break;
    }
    
    handleSendMessage(undefined, text);
    addToast('Campanha Disparada', `Mensagem automatizada de "${campaignType}" enviada via WhatsApp.`, 'success');
  };

  const getStageLabel = (stage: PipelineLead['stage']) => {
    switch (stage) {
      case 'lead': return 'Lead / Prospecção';
      case 'first_contact': return 'Primeiro Contato';
      case 'first_consult': return 'Primeira Consulta';
      case 'active': return 'Cliente Ativo';
      case 'treatment': return 'Em Tratamento';
      case 'return_pending': return 'Retorno Pendente';
      case 'inactive': return 'Inativo';
      case 'vip': return 'Fidelizado / VIP';
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
          <span className="text-[9px] text-stone-450 dark:text-stone-500 font-bold uppercase block mb-1">Disparos</span>
          <span className="text-lg font-black text-stone-800 dark:text-stone-100">{sentCount}</span>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-xl shadow-xs">
          <span className="text-[9px] text-stone-450 dark:text-stone-500 font-bold uppercase block mb-1">Entregues</span>
          <span className="text-lg font-black text-stone-800 dark:text-stone-100">{deliveredCount}</span>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-xl shadow-xs">
          <span className="text-[9px] text-stone-450 dark:text-stone-500 font-bold uppercase block mb-1">Visualizadas</span>
          <span className="text-lg font-black text-stone-800 dark:text-stone-100">{readCount}</span>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-xl shadow-xs">
          <span className="text-[9px] text-stone-450 dark:text-stone-500 font-bold uppercase block mb-1">Respostas</span>
          <span className="text-lg font-black text-stone-800 dark:text-stone-100">{replyCount}</span>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[9px] text-stone-450 dark:text-stone-500 font-bold uppercase block mb-1">Conversão</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-450">{conversionRate}%</span>
          </div>
          <Percent className="w-5 h-5 text-emerald-500 opacity-60" />
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200/85 dark:border-stone-800 p-4 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[9px] text-stone-450 dark:text-stone-500 font-bold uppercase block mb-1">Faturamento</span>
            <span className="text-lg font-black text-olive-650 dark:text-olive-400">R$ {revenueGenerated.toFixed(0)}</span>
          </div>
          <TrendingUp className="w-5 h-5 text-olive-500 opacity-60" />
        </div>
      </div>

      {/* 2. Grid Principal: Pipeline + Simulador WhatsApp */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Pipeline Kanban Slim */}
        <div className="xl:col-span-1 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4">
          <h4 className="font-extrabold text-sm text-stone-800 dark:text-stone-100 flex items-center gap-1.5 pb-3 border-b border-stone-150 dark:border-stone-800">
            <UserCheck className="w-4 h-4 text-olive-600" />
            CRM Pipeline de Tutores
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
                    Estágio
                  </span>
                </div>
                
                {/* Seletor de Estágio Rápido */}
                <div className="relative">
                  <select
                    value={lead.stage}
                    onChange={(e) => handleMoveStage(lead.tutorId, e.target.value as any)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-lg p-2 font-semibold text-[10px] cursor-pointer"
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
          <div className="p-4 bg-stone-50 dark:bg-stone-950 border-b border-stone-150 dark:border-stone-850 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-olive-500/10 dark:bg-olive-950 text-olive-650 dark:text-olive-400 flex items-center justify-center font-bold border dark:border-stone-850 shadow-inner">
                {selectedTutorId ? tutors.find(t => t.id === selectedTutorId)?.name[0].toUpperCase() : 'W'}
              </div>
              <div>
                <h5 className="font-extrabold text-stone-805 dark:text-stone-100 leading-tight">
                  {selectedTutorId ? tutors.find(t => t.id === selectedTutorId)?.name : 'Selecione um tutor'}
                </h5>
                <span className="text-[9px] text-stone-450 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  Simulador de WhatsApp Ativo
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTriggerCampaign('confirm')}
                className="inline-flex items-center gap-1 text-[9px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-olive-550 font-extrabold px-2.5 py-1.5 rounded-lg text-stone-600 dark:text-stone-300 cursor-pointer"
              >
                <CheckCheck className="w-3 h-3 text-emerald-500" />
                Lembrete
              </button>
              <button
                onClick={() => handleTriggerCampaign('vaccine')}
                className="inline-flex items-center gap-1 text-[9px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-olive-550 font-extrabold px-2.5 py-1.5 rounded-lg text-stone-600 dark:text-stone-300 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Vacina
              </button>
              <button
                onClick={() => handleTriggerCampaign('promo')}
                className="inline-flex items-center gap-1 text-[9px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-olive-550 font-extrabold px-2.5 py-1.5 rounded-lg text-stone-600 dark:text-stone-300 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-purple-500" />
                Cupom
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
                      : 'bg-white dark:bg-stone-850 text-stone-850 dark:text-stone-150 border border-stone-150 dark:border-stone-800 rounded-tl-none'
                  }`}>
                    <p className="text-[11.5px] leading-relaxed font-medium">{msg.text}</p>
                    
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
                          Ver
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
                title="Anexar PDF"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleSendFile('image')}
                className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-850 rounded-lg cursor-pointer"
                title="Anexar Imagem"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Digite uma mensagem..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 outline-none text-xs focus:border-olive-500"
            />
            
            <button
              type="submit"
              className="p-2.5 bg-olive-600 hover:bg-olive-750 text-white rounded-xl shadow-md cursor-pointer hover:scale-105 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
