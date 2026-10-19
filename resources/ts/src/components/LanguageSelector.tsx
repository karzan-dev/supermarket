import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LanguageSelectorProps {
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { language, setLanguage, t } = useApp();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard accessibility: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showLangMenu) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showLangMenu]);

  const languages = [
    { code: 'ku' as const, label: 'کوردی', subtitle: 'Kurdish' },
    { code: 'ar' as const, label: 'العربية', subtitle: 'Arabic' },
    { code: 'en' as const, label: 'English', subtitle: 'LTR' },
  ];

  const currentLangObj = languages.find(l => l.code === language) ?? languages[0]!;

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={langRef}>
      <button
        id="lang-selector-btn"
        type="button"
        onClick={() => setShowLangMenu(!showLangMenu)}
        className="-ml-[2px] inline-flex items-center justify-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 active:scale-95 whitespace-nowrap"
        aria-label={t('selectLanguage')}
        aria-expanded={showLangMenu}
        aria-haspopup="true"
      >
        <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
        <span className="hidden sm:inline font-medium">
          {currentLangObj.label}
        </span>
        <span className="sm:hidden font-mono uppercase text-[11px] font-bold">
          {language}
        </span>
        <ChevronDown 
          className={`w-3 h-3 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
            showLangMenu ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {showLangMenu && (
        <div 
          className="absolute end-0 top-full mt-1.5 w-44 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 text-sm animate-in fade-in slide-in-from-top-1"
          role="menu"
          aria-orientation="vertical"
        >
          {languages.map(item => {
            const isSelected = language === item.code;
            return (
              <button
                key={item.code}
                type="button"
                role="menuitem"
                onClick={() => {
                  setLanguage(item.code);
                  setShowLangMenu(false);
                }}
                className={`w-full text-start px-3.5 py-2 flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'text-teal-700 dark:text-teal-400 font-bold bg-teal-50/60 dark:bg-teal-950/40'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{item.label}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    ({item.subtitle})
                  </span>
                </div>
                {isSelected && (
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
