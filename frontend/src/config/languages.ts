export interface Language {
  code: string;
  name: string;
  nativeName: string;
  speechRecognitionCode: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  enabled: boolean;
  fontFamily?: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    speechRecognitionCode: 'en-US',
    flag: '🇺🇸',
    direction: 'ltr',
    enabled: true
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    speechRecognitionCode: 'hi-IN',
    flag: '🇮🇳',
    direction: 'ltr',
    enabled: true,
    fontFamily: "'Noto Sans Devanagari', 'Mangal', 'Arial', sans-serif"
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    speechRecognitionCode: 'bn-IN',
    flag: '🇮🇳',
    direction: 'ltr',
    enabled: true,
    fontFamily: "'Noto Sans Bengali', 'Shonar Bangla', 'Arial', sans-serif"
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    speechRecognitionCode: 'te-IN',
    flag: '🇮🇳',
    direction: 'ltr',
    enabled: true,
    fontFamily: "'Noto Sans Telugu', 'Gautami', 'Arial', sans-serif"
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    speechRecognitionCode: 'ta-IN',
    flag: '🇮🇳',
    direction: 'ltr',
    enabled: true,
    fontFamily: "'Noto Sans Tamil', 'Latha', 'Arial', sans-serif"
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    speechRecognitionCode: 'mr-IN',
    flag: '🇮🇳',
    direction: 'ltr',
    enabled: true,
    fontFamily: "'Noto Sans Devanagari', 'Mangal', 'Arial', sans-serif"
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    speechRecognitionCode: 'gu-IN',
    flag: '🇮🇳',
    direction: 'ltr',
    enabled: true,
    fontFamily: "'Noto Sans Gujarati', 'Shruti', 'Arial', sans-serif"
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    speechRecognitionCode: 'kn-IN',
    flag: '🇮🇳',
    direction: 'ltr',
    enabled: true,
    fontFamily: "'Noto Sans Kannada', 'Tunga', 'Arial', sans-serif"
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    speechRecognitionCode: 'ml-IN',
    flag: '🇮🇳',
    direction: 'ltr',
    enabled: true,
    fontFamily: "'Noto Sans Malayalam', 'Kartika', 'Arial', sans-serif"
  }
];

export const DEFAULT_LANGUAGE = 'en';