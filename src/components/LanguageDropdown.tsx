import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LANGUAGES = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English',   flag: '🇺🇸' },
  { code: 'es', label: 'Español',   flag: '🇪🇸' },
] as const;

type LangCode = 'pt' | 'en' | 'es';

interface LanguageDropdownProps {
  size?: 'sm' | 'md';
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ size = 'md' }) => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isSm = size === 'sm';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`lang-trigger flex items-center gap-2 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 transition-all cursor-pointer shadow-sm rounded-xl font-bold uppercase tracking-wider select-none focus:outline-none focus:ring-2 focus:ring-olive-500/20 ${
          isSm ? 'px-3 py-1.5 text-[10px]' : 'px-3.5 py-[10px] text-[11px]'
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className={`${isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-stone-400 dark:text-stone-500`} />
        <span>{language.toUpperCase()}</span>
        <ChevronDown
          className={`transition-transform duration-200 text-stone-400 dark:text-stone-500 ${open ? 'rotate-180' : ''} ${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'}`}
        />
      </button>

      {/* Dropdown: abre sempre para a direita (left-0), nunca sai pelo lado esquerdo */}
      <div
        className={`absolute left-0 top-full mt-2 w-48 z-[9999] rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl shadow-stone-900/10 dark:shadow-stone-950/40 overflow-hidden transition-all duration-200 origin-top-left ${
          open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
        }`}
        role="listbox"
      >
        {LANGUAGES.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={isActive}
              onClick={() => {
                setLanguage(lang.code as LangCode);
                setOpen(false);
              }}
              className={`lang-option w-full flex items-center justify-between px-4 py-3 text-xs font-bold transition-colors cursor-pointer border-none outline-none focus:outline-none ${
                isActive
                  ? 'lang-option--active bg-olive-500/10 text-olive-700 dark:text-olive-400'
                  : 'text-stone-700 dark:text-stone-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-black tracking-wider ${
                  isActive
                    ? 'bg-olive-500 text-white'
                    : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                }`}>
                  {lang.code}
                </span>
                <span>{lang.label}</span>
              </div>
              {isActive && <Check className="w-3.5 h-3.5 text-olive-600 dark:text-olive-400 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
