import { useState } from 'react';
import { useLanguage, Language } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
    setShowAll(false);
  };

  const displayedLanguages = showAll ? languages : languages.slice(0, 5);

  return (
    <div style={styles.container}>
      <button onClick={() => setIsOpen(!isOpen)} style={styles.triggerButton}>
        <Globe size={18} />
        <span>{languages.find(l => l.code === language)?.flag} {languages.find(l => l.code === language)?.name}</span>
      </button>
      
      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <strong>Select Language</strong>
            <button onClick={() => setIsOpen(false)} style={styles.closeButton}>×</button>
          </div>
          {displayedLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code as Language)}
              style={{
                ...styles.languageOption,
                ...(language === lang.code ? styles.languageOptionActive : {}),
              }}
            >
              <span style={styles.flag}>{lang.flag}</span>
              <span>{lang.name}</span>
              {language === lang.code && <span style={styles.checkMark}>✓</span>}
            </button>
          ))}
          {languages.length > 5 && !showAll && (
            <button onClick={() => setShowAll(true)} style={styles.showMoreButton}>
              + {languages.length - 5} more languages
            </button>
          )}
          {showAll && (
            <button onClick={() => setShowAll(false)} style={styles.showLessButton}>
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative' as const,
  },
  triggerButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  dropdown: {
    position: 'absolute' as const,
    top: '100%',
    right: 0,
    marginTop: '8px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
    zIndex: 1000,
    minWidth: '180px',
    maxHeight: '400px',
    overflow: 'auto' as const,
  },
  dropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-color)',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  languageOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'var(--text-primary)',
    textAlign: 'left' as const,
  },
  languageOptionActive: {
    background: 'rgba(59, 130, 246, 0.1)',
    color: '#3b82f6',
  },
  flag: {
    fontSize: '18px',
  },
  checkMark: {
    marginLeft: 'auto',
    color: '#10b981',
  },
  showMoreButton: {
    width: '100%',
    padding: '10px',
    background: 'transparent',
    border: 'none',
    borderTop: '1px solid var(--border-color)',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#3b82f6',
  },
  showLessButton: {
    width: '100%',
    padding: '10px',
    background: 'transparent',
    border: 'none',
    borderTop: '1px solid var(--border-color)',
    cursor: 'pointer',
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
};