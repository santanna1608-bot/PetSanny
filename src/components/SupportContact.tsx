import { Mail, MessageCircle } from 'lucide-react';

export function SupportContact() {
  return <section className="rounded-2xl border border-stone-200 p-5 dark:border-stone-800" aria-labelledby="support-title">
    <h3 id="support-title" className="font-bold">Suporte e cancelamento</h3>
    <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Precisa de ajuda ou deseja solicitar o cancelamento? Entre em contato. Não envie senhas, chaves de acesso ou dados de cartão.</p>
    <div className="mt-4 flex flex-wrap gap-4 text-sm">
      <a className="inline-flex items-center gap-2 rounded-lg p-2 text-olive-600" href="mailto:santanna1608@gmail.com"><Mail size={18} aria-hidden="true" />E-mail de suporte</a>
      <a className="inline-flex items-center gap-2 rounded-lg p-2 text-olive-600" href="https://wa.me/5521981062423" target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" />WhatsApp · (21) 98106-2423<span className="sr-only">, abre em nova aba</span></a>
    </div>
    <p className="mt-3 text-xs text-stone-500">Abrir o contato não cancela uma assinatura automaticamente. O pedido precisa ser confirmado pelo atendimento.</p>
  </section>;
}
