import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock } from 'lucide-react';

interface LegalTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy';
}

export const LegalTermsModal: React.FC<LegalTermsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms',
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-stone-955/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full max-h-[85vh] shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden animate-scale-up">
        {/* Cabeçalho */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-olive-500/10 text-olive-600 dark:text-olive-400">
              {activeTab === 'terms' ? <FileText className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                {activeTab === 'terms' ? 'Termos de Serviço e Uso' : 'Política de Privacidade & LGPD'}
              </h2>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                PetSanny · LF7 Marketing & IA
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 p-2 rounded-xl transition-all cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seleção de Abas */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-950/50 p-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Termos de Uso
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Privacidade e Proteção de Dados
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
          {activeTab === 'terms' ? (
            <>
              <section className="space-y-2">
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">1. Fornecedor e Objeto do Serviço</h3>
                <p>
                  O <strong>PetSanny</strong> é uma plataforma SaaS (Software as a Service) de gestão operacional para clínicas veterinárias, pet shops e centros de estética pet, desenvolvida e operada por <strong>LF7 Marketing & IA</strong>.
                </p>
                <p>
                  O serviço engloba ferramentas para agendamento inteligente, prontuário médico de acompanhamento, controle financeiro e de estoque, portal do tutor e assistente operacional baseado em inteligência artificial.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">2. Avaliação Gratuita (Teste de 7 Dias)</h3>
                <p>
                  Novos cadastros têm direito a 7 (sete) dias corridos de teste gratuito integral a partir da confirmação do e-mail de acesso, sem necessidade de cadastramento prévio de cartão de crédito. Durante o período de teste, a clínica tem acesso a 10 consultas no assistente com IA para exploração prática das funcionalidades.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">3. Planos, Cobrança e Renovação Recorrente</h3>
                <p>
                  As assinaturas são contratadas na modalidade mensal recorrente, processadas de forma segura através da instituição de pagamento homologada <strong>Asaas Gestão Financeira</strong>.
                </p>
                <p>
                  O valor cobrado confere direito ao uso contínuo da plataforma durante os 30 dias subsequentes à confirmação do pagamento. O PetSanny não armazena dados de cartão de crédito em seus servidores.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">4. Cancelamento e Encerramento</h3>
                <p>
                  O cancelamento da assinatura mensal pode ser solicitado a qualquer momento pelo titular da clínica, através dos canais de suporte oficiais:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>E-mail: <strong>santanna1608@gmail.com</strong></li>
                  <li>WhatsApp de suporte: <strong>(21) 98106-2423</strong></li>
                </ul>
                <p>
                  O cancelamento interrompe cobranças futuras e mantém o acesso da clínica garantido até o encerramento do ciclo mensal já quitado. Não há cobrança de taxa de rescisão ou fidelidade contratual.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">5. Responsabilidade Técnica e Assistente com IA</h3>
                <p>
                  O PetSanny é estritamente uma plataforma tecnológica de apoio operacional. As decisões de diagnóstico, prescrição médica veterinária e procedimentos cirúrgicos ou estéticos são de exclusiva responsabilidade dos profissionais habilitados da clínica contratante.
                </p>
                <p>
                  O assistente com IA atua como suporte à consulta de agenda, pendências e rascunhos de mensagens operacionais, não executando prescrições médicas e não realizando envios automatizados sem a conferência humana prévia.
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-2">
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">1. Conformidade com a LGPD (Lei nº 13.709/2018)</h3>
                <p>
                  O PetSanny atua em estrita conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD). A clínica contratante figura como <strong>Controladora</strong> dos dados de seus tutores e animais, cabendo ao PetSanny o papel de <strong>Operador</strong> no processamento e custódia segura dessas informações.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">2. Isolamento e Segurança da Informação</h3>
                <p>
                  Cada clínica possui seu ambiente protegido por <em>Row Level Security</em> (RLS) no banco de dados. Os documentos e exames anexados são custodiados em repositório privado, com acesso temporário concedido via URLs pré-assinadas com validade de 60 segundos.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">3. Tratamento de Dados e Inteligência Artificial</h3>
                <p>
                  Prontuários e laudos confidenciais de animais nunca são submetidos a provedores de inteligência artificial ou utilizados para treinamento de modelos generativos de terceiros.
                </p>
                <p>
                  As consultas realizadas ao assistente operacional enviam exclusivamente metadados operacionais da sessão ativa e perguntas formuladas pelo usuário, sem expor registros médicos de pacientes.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">4. Portal do Tutor</h3>
                <p>
                  Os links compartilhados com os tutores possuem prazo de expiração de 48 horas e são protegidos por identificadores seguros criptografados (hash SHA-256), restringindo o acesso unicamente ao atendimento específico compartilhado e permitindo revogação imediata pela clínica a qualquer momento.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">5. Direitos do Titular de Dados e Contato</h3>
                <p>
                  A qualquer momento, o gestor da clínica pode solicitar a retificação ou exclusão definitiva de registros através dos canais de suporte oficiais (santanna1608@gmail.com).
                </p>
              </section>
            </>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <span className="text-[10px] text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-olive-600 dark:text-olive-400" />
            Privacidade e dados protegidos por criptografia
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-olive-600 hover:bg-olive-700 text-white font-bold rounded-xl transition-all cursor-pointer text-xs shadow-md shadow-olive-900/10"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
