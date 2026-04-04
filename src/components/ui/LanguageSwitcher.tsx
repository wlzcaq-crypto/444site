'use client';

import { useTransition, useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { locales, localeNames, type Locale } from '@/i18n/config';
import { setUserLocale } from '@/i18n/locale';

export function LanguageSwitcher() {
  const t = useTranslations('language');
  const currentLocale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as HTMLElement)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = (locale: Locale) => {
    startTransition(() => {
      setUserLocale(locale);
    });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
          isOpen
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        } ${isPending ? 'opacity-60' : ''}`}
        disabled={isPending}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{localeNames[currentLocale as Locale]}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-200/60 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t('switchLanguage')}
            </p>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLocaleChange(locale)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors duration-150 ${
                  currentLocale === locale
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-base">{localeNames[locale]}</span>
                {currentLocale === locale && (
                  <Check className="w-4 h-4 ml-auto text-indigo-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
