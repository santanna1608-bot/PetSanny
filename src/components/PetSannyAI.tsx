import React, { useState, useEffect, useRef } from 'react';
import { useAppointments } from '../contexts/AppointmentsContext';
import { 
  Sparkles, 
  X, 
  Send, 
  Loader, 
  BrainCircuit
} from 'lucide-react';

interface AIMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  actions?: Array<{ label: string; onClick: () => void }>;
}

export const PetSannyAI: React.FC = () => {
  const { appointments, currentTenant, addToast } = useAppointments();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Inicializa mensagens boas-vindas
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: `Olá! Eu sou o PetSanny AI, seu assistente inteligente de gestão veterinária. 🧠💡\n\nPosso ajudar você a encontrar informações rápidas sobre o faturamento, vacinas, produtos acabando, agendar lembretes e rodar campanhas para tutores inativos. O que gostaria de fazer hoje?`
      }
    ]);
  }, [currentTenant]);

  // Rola para baixo no chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Processa a inteligência contextual
  const processQuery = async (query: string) => {
    setIsTyping(true);
    
    // Simula tempo de processamento inteligente de 1.2s
    await new Promise((resolve) => setTimeout(resolve, 1100));
    
    const normalized = query.toLowerCase();
    let reply = '';
    let actions: AIMessage['actions'] = [];

    // 1. ANÁLISE DE FATURAMENTO
    if (normalized.includes('fatur') || normalized.includes('receit') || normalized.includes('dinheir') || normalized.includes('quanto faturamos')) {
      const revenue = appointments
        .filter(app => app.status === 'confirmed' || app.status === 'completed')
        .reduce((sum, app) => sum + Number(app.price), 0);
      
      const pendingRevenue = appointments
        .filter(app => app.status === 'pending')
        .reduce((sum, app) => sum + Number(app.price), 0);

      reply = `Analisando o financeiro do tenant **${currentTenant.name}**: \n\n💰 **Faturamento Realizado (Mês):** R$ ${revenue.toFixed(2)}\n⏱️ **Receita Pendente na Agenda:** R$ ${pendingRevenue.toFixed(2)}\n📊 **Total Estimado:** R$ ${(revenue + pendingRevenue).toFixed(2)}\n\nGostaria de emitir o relatório consolidado de caixa?`;
      actions = [
        {
          label: 'Emitir PDF do Faturamento',
          onClick: () => {
            addToast('Relatório Gerado', 'PDF com o consolidado financeiro do mês foi baixado.', 'success');
            setMessages(prev => [...prev, { id: Math.random().toString(), sender: 'ai', text: '📄 **Relatório Financeiro.pdf** foi gerado com sucesso e está pronto!' }]);
          }
        }
      ];
    }
    
    // 2. VETERINÁRIO MAIS ATIVO
    else if (normalized.includes('veterinario') || normalized.includes('profissional') || normalized.includes('consulta')) {
      const vets: Record<string, number> = {};
      appointments.forEach(app => {
        if (app.professional_name) {
          vets[app.professional_name] = (vets[app.professional_name] || 0) + 1;
        }
      });

      let topVet = 'Nenhum';
      let maxCount = 0;
      Object.entries(vets).forEach(([name, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topVet = name;
        }
      });

      reply = `O profissional mais ativo do momento é **${topVet}**, com um total de **${maxCount} agendamentos** no sistema para este tenant.\n\nDeseja ver a escala de trabalho e a ocupação das salas para hoje?`;
    }

    // 3. VACINAS E ALERTAS VENCENDO
    else if (normalized.includes('vacina') || normalized.includes('venc') || normalized.includes('alerta') || normalized.includes('estoque')) {
      reply = `Localizei as seguintes demandas de vacinação e controle no estoque:\n\n💉 **Vacina V10 Importada**: 18 unidades (Lote V10-998822 vencendo em breve no dia 30/08/2026).\n⚠️ **Shampoo Hexamidina**: Abaixo do estoque mínimo (Apenas 4 frascos disponíveis).\n\nDeseja disparar um alerta automático de lembrete de vacinação para os tutores dos pets que estão com a dose vencendo?`;
      actions = [
        {
          label: 'Disparar Lembretes de Vacina',
          onClick: () => {
            addToast('Disparo Concluído', 'Mensagens de alerta de vacinação enviadas para 4 tutores via WhatsApp.', 'success');
            setMessages(prev => [...prev, { id: Math.random().toString(), sender: 'ai', text: '✅ Lembretes de imunização enviados com sucesso para os tutores de Toby, Mel, Thor e Luna.' }]);
          }
        }
      ];
    }

    // 4. TUTORES INATIVOS (CRM HÁ MAIS DE 90 DIAS)
    else if (normalized.includes('retorn') || normalized.includes('inativ') || normalized.includes('90 dias') || normalized.includes('campanha')) {
      reply = `Identifiquei **3 tutores** que não visitam a clínica há mais de 90 dias:\n\n👤 **Ana Souza** (Pet: Toby)\n👤 **Bruno Lima** (Pet: Mel)\n👤 **Eliana Costa** (Pet: Luna)\n\nPodemos criar uma campanha automatizada via WhatsApp oferecendo 15% de desconto no banho e tosa para trazê-los de volta. Deseja iniciar?`;
      actions = [
        {
          label: 'Iniciar Campanha 15% Desc.',
          onClick: () => {
            addToast('Campanha de Retorno', 'Campanha de reengajamento iniciada no CRM e enviada via WhatsApp.', 'success');
            setMessages(prev => [...prev, { id: Math.random().toString(), sender: 'ai', text: '🚀 Campanha disparada! Cupom **RETORNO15** enviado via WhatsApp para Ana, Bruno e Eliana. Respostas simuladas iniciadas.' }]);
          }
        }
      ];
    }

    // 5. PADRÃO / OUTROS
    else {
      reply = `Desculpe, não entendi perfeitamente. Posso processar análises sobre faturamento, vacinas, produtos acabando, agendar lembretes e rodar campanhas para tutores inativos.\n\nTente algo como: \n- *"Quanto faturamos este mês?"*\n- *"Quais vacinas vencem este mês?"*\n- *"Crie uma campanha para clientes de banho."*\n- *"Qual veterinário possui mais consultas?"*`;
    }

    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'ai',
      text: reply,
      actions: actions.length > 0 ? actions : undefined
    }]);

    setIsTyping(false);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text: userText
    }]);

    setInputText('');
    processQuery(userText);
  };

  const handleSuggestionClick = (text: string) => {
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text: text
    }]);
    processQuery(text);
  };

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center shadow-2xl border border-stone-850 dark:border-stone-200 z-50 cursor-pointer hover:scale-105 active:scale-95 transition-all animate-bounce"
        title="Falar com PetSanny AI"
      >
        {isOpen ? <X className="w-6 h-6 animate-fade-in" /> : <BrainCircuit className="w-6 h-6 animate-pulse text-emerald-500 dark:text-emerald-600" />}
      </button>

      {/* Janela de Chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[90vw] h-[500px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in text-xs text-stone-850 dark:text-stone-150">
          
          {/* Header */}
          <div className="p-4 bg-stone-900 text-stone-100 flex items-center justify-between shrink-0 border-b dark:border-stone-800">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-450 animate-pulse" />
              <div>
                <h5 className="font-extrabold text-xs">PetSanny AI</h5>
                <span className="text-[9px] text-stone-400 font-bold block">Assistente Virtual Inteligente</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Área de Conversa */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-stone-50/50 dark:bg-stone-950/20">
            {messages.map((msg) => {
              const isAI = msg.sender === 'ai';
              return (
                <div key={msg.id} className={`flex ${isAI ? 'justify-start' : 'justify-end'} gap-2.5`}>
                  {isAI && (
                    <div className="w-7 h-7 rounded-lg bg-stone-900 dark:bg-stone-800 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-stone-800">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                  <div className="space-y-2.5 max-w-[80%]">
                    <div className={`p-3 rounded-2xl shadow-xs whitespace-pre-line leading-relaxed font-medium ${
                      isAI 
                        ? 'bg-white dark:bg-stone-850 border border-stone-150 dark:border-stone-805 text-stone-800 dark:text-stone-200 rounded-tl-none' 
                        : 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded-tr-none'
                    }`}>
                      {msg.text}
                    </div>

                    {/* Ações Inteligentes Incorporadas */}
                    {msg.actions && (
                      <div className="flex flex-col gap-1.5 self-start">
                        {msg.actions.map((act, i) => (
                          <button
                            key={i}
                            onClick={act.onClick}
                            className="bg-white dark:bg-stone-900 border border-olive-500 hover:bg-olive-500/5 text-olive-650 dark:text-olive-400 font-extrabold px-3 py-1.5 rounded-xl cursor-pointer shadow-xs self-start text-[10px]"
                          >
                            {act.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-stone-900 dark:bg-stone-800 text-emerald-500 flex items-center justify-center shrink-0 border border-stone-850">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-white dark:bg-stone-850 border border-stone-150 dark:border-stone-805 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <Loader className="w-3.5 h-3.5 text-stone-400 animate-spin" />
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Analisando dados...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Sugestões de Perguntas Rápidas (só aparecem se não houver conversas longas ou para reiniciar) */}
          {messages.length <= 2 && (
            <div className="p-3 bg-stone-50 dark:bg-stone-950 border-t dark:border-stone-850 shrink-0 flex flex-wrap gap-1.5">
              {[
                'Quanto faturamos este mês?',
                'Quais vacinas vencem este mês?',
                'Quem não retorna há mais de 90 dias?'
              ].map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(sug)}
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-stone-300 hover:bg-stone-50 text-stone-600 dark:text-stone-400 font-bold px-2 py-1 rounded-lg text-[9px] cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Input do Chat */}
          <form 
            onSubmit={handleSend}
            className="p-3 bg-stone-50 dark:bg-stone-955 border-t border-stone-150 dark:border-stone-850 flex items-center gap-2.5 shrink-0"
          >
            <input
              type="text"
              placeholder="Pergunte ao PetSanny AI..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2 outline-none text-xs focus:border-olive-500 text-stone-800 dark:text-stone-100"
            />
            <button
              type="submit"
              className="p-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
