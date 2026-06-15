import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Languages } from 'lucide-react';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Available languages - matching the Language type
  const availableLanguages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (languageCode: string) => {
    setLanguage(languageCode as any);
    setIsOpen(false);
  };

  // Group languages by script for better organization
  const devanagariLanguages = availableLanguages.filter(l => ['hi', 'mr'].includes(l.code));
  const dravidianLanguages = availableLanguages.filter(l => ['ta', 'te', 'kn', 'ml'].includes(l.code));
  const otherLanguages = availableLanguages.filter(l => ['en', 'bn', 'gu'].includes(l.code));

  return (
    <div ref={dropdownRef} style={styles.container}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.selectorButton}
        aria-label={t('common.language')}
      >
        <Languages size={16} />
        <span style={styles.languageName}>
          {availableLanguages.find(l => l.code === language)?.nativeName || 'Language'}
        </span>
        <span style={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div style={styles.dropdown}>
          {/* Devanagari Languages (Hindi, Marathi) */}
          <div style={styles.groupTitle}>देवनागरी / Devanagari</div>
          {devanagariLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              style={{
                ...styles.languageOption,
                ...(language === lang.code ? styles.activeOption : {})
              }}
            >
              <span style={styles.flag}>{lang.flag}</span>
              <div style={styles.languageInfo}>
                <div style={styles.languageNameText}>{lang.nativeName}</div>
                <div style={styles.languageCodeText}>{lang.name}</div>
              </div>
              {language === lang.code && <span style={styles.checkMark}>✓</span>}
            </button>
          ))}

          {/* Dravidian Languages (Tamil, Telugu, Kannada, Malayalam) */}
          <div style={styles.groupTitle}>திராவிட / Dravidian</div>
          {dravidianLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              style={{
                ...styles.languageOption,
                ...(language === lang.code ? styles.activeOption : {})
              }}
            >
              <span style={styles.flag}>{lang.flag}</span>
              <div style={styles.languageInfo}>
                <div style={styles.languageNameText}>{lang.nativeName}</div>
                <div style={styles.languageCodeText}>{lang.name}</div>
              </div>
              {language === lang.code && <span style={styles.checkMark}>✓</span>}
            </button>
          ))}

          {/* Other Languages (English, Bengali, Gujarati) */}
          <div style={styles.groupTitle}>Others</div>
          {otherLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              style={{
                ...styles.languageOption,
                ...(language === lang.code ? styles.activeOption : {})
              }}
            >
              <span style={styles.flag}>{lang.flag}</span>
              <div style={styles.languageInfo}>
                <div style={styles.languageNameText}>{lang.nativeName}</div>
                <div style={styles.languageCodeText}>{lang.name}</div>
              </div>
              {language === lang.code && <span style={styles.checkMark}>✓</span>}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    position: 'relative' as const,
    display: 'inline-block',
  },
  selectorButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    transition: 'all 0.2s ease',
  },
  languageName: {
    fontSize: '12px',
  },
  arrow: {
    fontSize: '10px',
    marginLeft: '4px',
  },
  dropdown: {
    position: 'absolute' as const,
    top: '100%',
    right: 0,
    marginTop: '8px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
    minWidth: '220px',
    maxHeight: '400px',
    overflowY: 'auto' as const,
    animation: 'fadeIn 0.2s ease',
  },
  groupTitle: {
    padding: '8px 12px',
    fontSize: '10px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  languageOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '8px 12px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'background 0.2s ease',
  },
  activeOption: {
    background: 'rgba(139, 92, 246, 0.1)',
  },
  flag: {
    fontSize: '18px',
  },
  languageInfo: {
    flex: 1,
  },
  languageNameText: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  languageCodeText: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
  },
  checkMark: {
    color: '#8b5cf6',
    fontSize: '12px',
    fontWeight: 'bold',
  },
};

export default LanguageSelector;