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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];
  const isSm = size === 'sm';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-850 hover:text-stone-900 dark:hover:text-stone-100 transition-all cursor-pointer shadow-sm rounded-xl font-bold uppercase tracking-wider select-none ${
          isSm ? 'px-2.5 py-1.5 text-[10px]' : 'px-3 py-[10px] text-[11px]'
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>{current.flag} {current.code.toUpperCase()}</span>
        <ChevronDown
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''} ${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'}`}
        />
      </button>

      <div
        className={`absolute right-0 mt-2 w-44 z-[9999] rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl shadow-stone-900/10 dark:shadow-stone-950/40 overflow-hidden transition-all duration-200 origin-top-right ${
          open ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
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
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-olive-50 dark:bg-olive-950/40 text-olive-700 dark:text-olive-400'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-850 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="flex-1 text-left">{lang.label}</span>
              {isActive && <Check className="w-3.5 h-3.5 text-olive-600 dark:text-olive-400 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
