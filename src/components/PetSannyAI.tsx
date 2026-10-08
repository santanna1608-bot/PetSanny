import { useState } from "react";
import { Sparkles } from "lucide-react";
export function PetSannyAI() {
  const [open, setOpen] = useState(false);
  return (
    <aside className="fixed right-5 bottom-5 z-30">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Informações do assistente"
        className="rounded-full p-4 bg-olive-600 text-white shadow-lg"
      >
        <Sparkles />
      </button>
      {open && (
        <div className="absolute right-0 bottom-16 w-72 rounded-2xl border bg-white dark:bg-stone-900 p-5 shadow-xl">
          <h2 className="font-bold">Assistente em preparação</h2>
          <p className="text-sm mt-2">
            A análise inteligente será disponibilizada após a integração segura.
            Consulte a agenda, o financeiro e os alertas nos módulos do sistema.
          </p>
          <button className="mt-3" onClick={() => setOpen(false)}>
            Fechar
          </button>
        </div>
      )}
    </aside>
  );
}
