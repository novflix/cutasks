import { useState, useRef, useEffect } from 'react';
import i18n from 'i18next';
import { LANGUAGES, setLanguage, type LanguageCode } from '../i18n';

interface LanguagePickerProps {
  compact?: boolean;
}

export default function LanguagePicker({ compact }: LanguagePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  function handleSelect(code: LanguageCode) {
    setLanguage(code);
    setOpen(false);
  }

  if (compact) {
    return (
      <div className={`lp-lang-picker${open ? ' lp-lang-picker--open' : ''}`} ref={ref}>
        <button className="lp-lang-picker__current" onClick={() => setOpen((v) => !v)}>
          <span className={`fi fi-${current.countryCode} lp-lang-picker__flag`} />
          <svg className={`lp-lang-picker__chevron${open ? ' open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <div className="lp-lang-picker__list">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`lp-lang-picker__item${i18n.language === lang.code ? ' active' : ''}`}
              onClick={() => handleSelect(lang.code)}
            >
              <span className={`fi fi-${lang.countryCode} lp-lang-picker__flag`} />
              <span className="lp-lang-picker__label">{lang.label}</span>
              <div className="lp-lang-picker__radio">
                <div className="lp-lang-picker__dot" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`lang-picker${open ? ' lang-picker--open' : ''}`} ref={ref}>
      <button className="lang-picker__current" onClick={() => setOpen((v) => !v)}>
        <span className={`fi fi-${current.countryCode} lang-picker__flag`} />
        <span className="lang-picker__label">{current.label}</span>
        <svg className={`lang-picker__chevron${open ? ' open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className="lang-picker__list">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            className={`lang-picker__item${i18n.language === lang.code ? ' active' : ''}`}
            onClick={() => handleSelect(lang.code)}
          >
            <span className={`fi fi-${lang.countryCode} lang-picker__flag`} />
            <span className="lang-picker__label">{lang.label}</span>
            <div className="lang-picker__radio">
              <div className="lang-picker__dot" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
