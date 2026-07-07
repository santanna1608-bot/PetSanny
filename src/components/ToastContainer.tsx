import React from 'react';
import { useAppointments } from '../contexts/AppointmentsContext';
import { CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppointments();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isInfo = toast.type === 'info';
        
        let icon = <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />;
        let borderClass = 'border-emerald-100 bg-emerald-50/95';
        
        if (isInfo) {
          icon = <Info className="w-5 h-5 text-blue-600 shrink-0" />;
          borderClass = 'border-blue-100 bg-blue-50/95';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
          borderClass = 'border-amber-100 bg-amber-50/95';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 animate-slide-in ${borderClass}`}
            style={{
              animation: 'slideIn 0.25s ease-out forwards'
            }}
          >
            {icon}
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-stone-900 leading-tight">
                {toast.title}
              </h4>
              <p className="text-xs text-stone-600 mt-1 whitespace-pre-line leading-relaxed">
                {toast.description}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-stone-600 transition-colors p-0.5 rounded-lg hover:bg-stone-100/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(1rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
