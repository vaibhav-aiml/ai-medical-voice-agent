import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Import JSON files directly
import enTranslations from '../translations/en.json';
import hiTranslations from '../translations/hi.json';
import taTranslations from '../translations/ta.json';
import teTranslations from '../translations/te.json';
import bnTranslations from '../translations/bn.json';
import mrTranslations from '../translations/mr.json';
import guTranslations from '../translations/gu.json';
import knTranslations from '../translations/kn.json';
import mlTranslations from '../translations/ml.json';

export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'gu' | 'kn' | 'ml';

interface LanguageContextType {
  language: Language;
  currentLanguage: Language;
  availableLanguages: { code: Language; name: string; nativeName: string; flag: string }[];
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const availableLanguages = [
  { code: 'en' as Language, name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi' as Language, name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta' as Language, name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te' as Language, name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn' as Language, name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr' as Language, name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu' as Language, name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn' as Language, name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml' as Language, name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
];

// Helper function to flatten nested objects
const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
  const result: Record<string, string> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(result, flattenObject(obj[key], newKey));
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  return result;
};

// Flatten all translations
const translations: Record<Language, Record<string, string>> = {
  en: flattenObject(enTranslations),
  hi: flattenObject(hiTranslations),
  ta: flattenObject(taTranslations),
  te: flattenObject(teTranslations),
  bn: flattenObject(bnTranslations),
  mr: flattenObject(mrTranslations),
  gu: flattenObject(guTranslations),
  kn: flattenObject(knTranslations),
  ml: flattenObject(mlTranslations),
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.setAttribute('data-language', language);
    
    const fontMap: Record<Language, string> = {
      en: 'inherit',
      hi: "'Noto Sans Devanagari', 'Mangal', sans-serif",
      ta: "'Noto Sans Tamil', 'Latha', sans-serif",
      te: "'Noto Sans Telugu', 'Gautami', sans-serif",
      bn: "'Noto Sans Bengali', 'Shonar Bangla', sans-serif",
      mr: "'Noto Sans Devanagari', 'Mangal', sans-serif",
      gu: "'Noto Sans Gujarati', 'Shruti', sans-serif",
      kn: "'Noto Sans Kannada', 'Tunga', sans-serif",
      ml: "'Noto Sans Malayalam', 'Kartika', sans-serif",
    };
    document.documentElement.style.fontFamily = fontMap[language];
  }, [language]);

  const t = (key: string): string => {
    try {
      const translation = translations[language]?.[key];
      if (translation) return translation;
      return translations.en[key] || key;
    } catch (error) {
      return key;
    }
  };

  const currentLanguage = language;
  const availableLanguagesList = availableLanguages;

  return (
    <LanguageContext.Provider value={{ 
      language, 
      currentLanguage,
      availableLanguages: availableLanguagesList,
      setLanguage, 
      t 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};