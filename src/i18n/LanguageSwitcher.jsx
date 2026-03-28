import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from './supportedLanguages';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const currentLang = supportedLanguages.find(l => l.code === i18n.language) || supportedLanguages[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-low transition-all text-sm font-medium"
        aria-label="Select language"
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.nativeName}</span>
        <span className="material-symbols-outlined text-sm">arrow_drop_down</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container-high overflow-hidden z-50">
          <div className="py-2 max-h-80 overflow-y-auto">
            <div className="px-4 py-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Select Language
            </div>
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high transition-colors ${
                  lang.code === i18n.language ? 'bg-primary/10 text-primary' : 'text-on-surface'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{lang.nativeName}</span>
                  <span className="text-xs text-on-surface-variant">{lang.name}</span>
                </div>
                {lang.code === i18n.language && (
                  <span className="material-symbols-outlined text-primary ml-auto">check</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
