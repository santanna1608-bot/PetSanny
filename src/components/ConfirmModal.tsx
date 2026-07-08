import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  isDanger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onClose,
  isDanger = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-stone-955/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-sm w-full shadow-2xl border border-stone-200 dark:border-stone-800/80 overflow-hidden animate-scale-up">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-stone-150 dark:border-stone-800/80 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isDanger ? 'bg-rose-500/10 text-rose-500' : 'bg-olive-500/10 text-olive-500'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-stone-850 dark:text-stone-100 uppercase tracking-wider">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-850 p-1.5 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5 text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
          {message}
        </div>

        {/* Ações */}
        <div className="p-4 bg-stone-50 dark:bg-stone-950/40 border-t border-stone-150 dark:border-stone-800/80 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-stone-250 dark:border-stone-800 text-stone-550 dark:text-stone-400 font-bold rounded-xl hover:bg-stone-100 dark:hover:bg-stone-900 transition-all cursor-pointer text-[10px]"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white font-bold rounded-xl transition-all cursor-pointer text-[10px] ${
              isDanger 
                ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-900/10' 
                : 'bg-olive-600 hover:bg-olive-700 shadow-md shadow-olive-900/10'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
