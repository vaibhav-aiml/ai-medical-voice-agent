import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'gu' | 'kn' | 'ml' | 'pa';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.reports': 'Reports',
    'nav.appointments': 'Appointments',
    'nav.symptomChecker': 'Symptom Checker',
    'nav.healthTips': 'Health Tips',
    'nav.emergency': 'Emergency',
    'nav.healthGoals': 'Health Goals',
    'nav.voiceSettings': 'Voice Settings',
    'nav.progress': 'Progress',
    'nav.twoFactor': '2FA',
    'nav.newConsultation': 'New Consultation',
    
    // Home
    'home.welcome': 'Welcome back',
    'home.aiPowered': 'AI-Powered Healthcare',
    'home.subtitle': 'Your personal AI medical assistant. Get instant advice from specialized doctors, anytime, anywhere.',
    'home.consultations': 'Consultations',
    'home.completed': 'Completed',
    'home.avgMinutes': 'Avg Minutes',
    'home.voiceConsultation': 'Voice Consultation',
    'home.voiceDesc': 'Speak naturally and get real-time AI responses',
    'home.specialists': '5+ Specialists',
    'home.specialistsDesc': 'General, Orthopedic, Cardiologist & more',
    'home.medicalReports': 'Medical Reports',
    'home.medicalReportsDesc': 'Download detailed PDF reports instantly',
    'home.startConsultation': 'Start Consultation',
    
    // Consultation
    'consultation.title': 'AI Medical Consultation',
    'consultation.subtitle': 'Get expert advice from our AI specialists',
    'consultation.selectSpecialist': 'Select Specialist',
    'consultation.startWith': 'Start Consultation with',
    'consultation.selectedSpecialist': 'Selected Specialist',
    'consultation.endConsultation': 'End Consultation',
    'consultation.voiceMode': 'Voice Mode',
    'consultation.textMode': 'Text Mode',
    'consultation.startSpeaking': 'Start Speaking',
    'consultation.stopRecording': 'Stop Recording',
    'consultation.recording': 'Recording... Speak clearly!',
    'consultation.analyzing': 'AI Doctor is analyzing your symptoms...',
    'consultation.sendToAI': 'Send to AI Doctor',
    'consultation.exampleSymptom': 'Example Symptom',
    'consultation.describeSymptoms': 'Describe your symptoms in detail:',
    
    // Reports
    'reports.title': 'Medical Reports',
    'reports.subtitle': 'Access and download your consultation reports',
    'reports.viewReport': 'View Report',
    'reports.bookFollowup': 'Book Follow-up',
    'reports.rateConsultation': 'Rate Consultation',
    'reports.symptoms': 'Symptoms',
    'reports.duration': 'Duration',
    'reports.completed': 'Completed',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Overview of your medical consultations',
    'dashboard.consultationHistory': 'Consultation History',
    'dashboard.noConsultations': 'No consultations yet',
    'dashboard.startFirst': 'Start Your First Consultation',
    
    // Appointments
    'appointments.title': 'My Appointments',
    'appointments.bookNew': 'Book New Appointment',
    'appointments.date': 'Date',
    'appointments.time': 'Time',
    'appointments.reason': 'Reason',
    'appointments.status': 'Status',
    'appointments.cancel': 'Cancel',
    'appointments.noAppointments': 'No appointments yet',
    
    // Emergency
    'emergency.title': 'Emergency Information',
    'emergency.medicalInfo': 'Medical Information',
    'emergency.contacts': 'Emergency Contacts',
    'emergency.addContact': 'Add Contact',
    'emergency.primary': 'Primary',
    'emergency.setPrimary': 'Set as Primary',
    'emergency.instructions': 'In Case of Emergency',
    'emergency.callEmergency': 'Call emergency services immediately for life-threatening situations',
    
    // Health Goals
    'healthGoals.title': 'Health Goals & Tracking',
    'healthGoals.todayLog': 'Today\'s Log',
    'healthGoals.water': 'Water',
    'healthGoals.steps': 'Steps',
    'healthGoals.sleep': 'Sleep',
    'healthGoals.calories': 'Calories',
    'healthGoals.mood': 'Mood',
    'healthGoals.weeklyAvg': 'Weekly Average',
    'healthGoals.addGoal': 'Add Goal',
    'healthGoals.progress': 'Progress',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.confirm': 'Confirm',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.warning': 'Warning',
    'common.info': 'Info',
  },
  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.reports': 'रिपोर्ट',
    'nav.appointments': 'अपॉइंटमेंट',
    'nav.symptomChecker': 'लक्षण जांच',
    'nav.healthTips': 'स्वास्थ्य टिप्स',
    'nav.emergency': 'आपातकाल',
    'nav.healthGoals': 'स्वास्थ्य लक्ष्य',
    'nav.voiceSettings': 'आवाज सेटिंग',
    'nav.progress': 'प्रगति',
    'nav.twoFactor': '2FA',
    'nav.newConsultation': 'नई परामर्श',
    
    // Home
    'home.welcome': 'वापसी पर स्वागत है',
    'home.aiPowered': 'एआई संचालित स्वास्थ्य सेवा',
    'home.subtitle': 'आपका निजी एआई चिकित्सा सहायक। विशेषज्ञ डॉक्टरों से तुरंत सलाह लें, कभी भी, कहीं भी।',
    'home.consultations': 'परामर्श',
    'home.completed': 'पूर्ण',
    'home.avgMinutes': 'औसत मिनट',
    'home.voiceConsultation': 'आवाज परामर्श',
    'home.voiceDesc': 'प्राकृतिक रूप से बोलें और वास्तविक समय में एआई प्रतिक्रिया प्राप्त करें',
    'home.specialists': '5+ विशेषज्ञ',
    'home.specialistsDesc': 'जनरल, ऑर्थोपेडिक, कार्डियोलॉजिस्ट और अधिक',
    'home.medicalReports': 'मेडिकल रिपोर्ट',
    'home.medicalReportsDesc': 'तुरंत विस्तृत पीडीएफ रिपोर्ट डाउनलोड करें',
    'home.startConsultation': 'परामर्श शुरू करें',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.close': 'बंद करें',
    'common.back': 'पीछे',
    'common.next': 'आगे',
    'common.submit': 'जमा करें',
    'common.confirm': 'पुष्टि करें',
    'common.success': 'सफलता',
    'common.error': 'त्रुटि',
    'common.warning': 'चेतावनी',
    'common.info': 'जानकारी',
  },
  ta: {
    'nav.home': 'முகப்பு',
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.reports': 'அறிக்கைகள்',
    'nav.appointments': 'சந்திப்புகள்',
    'nav.newConsultation': 'புதிய ஆலோசனை',
    'home.welcome': 'மீண்டும் வருக',
    'home.startConsultation': 'ஆலோசனையை தொடங்குங்கள்',
    'common.loading': 'ஏற்றப்படுகிறது...',
    'common.save': 'சேமி',
    'common.cancel': 'ரத்து செய்',
    'common.delete': 'நீக்கு',
    'common.edit': 'திருத்து',
    'common.close': 'மூடு',
    'common.back': 'பின் செல்',
    'common.submit': 'சமர்ப்பிக்கவும்',
    'common.confirm': 'உறுதி செய்',
    'common.success': 'வெற்றி',
    'common.error': 'பிழை',
    'common.warning': 'எச்சரிக்கை',
    'common.info': 'தகவல்',
  },
  te: {
    'nav.home': 'హోమ్',
    'nav.dashboard': 'డ్యాష్బోర్డ్',
    'nav.reports': 'నివేదికలు',
    'nav.appointments': 'అపాయింట్మెంట్లు',
    'nav.newConsultation': 'కొత్త సంప్రదింపులు',
    'home.welcome': 'తిరిగి స్వాగతం',
    'home.startConsultation': 'సంప్రదింపులు ప్రారంభించండి',
    'common.loading': 'లోడ్ అవుతుంది...',
    'common.save': 'సేవ్ చేయి',
    'common.cancel': 'రద్దు చేయి',
    'common.delete': 'తొలగించు',
    'common.edit': 'సవరించు',
    'common.close': 'మూసివేయి',
    'common.back': 'వెనుకకు',
    'common.submit': 'సమర్పించు',
    'common.confirm': 'నిర్ధారించు',
    'common.success': 'విజయం',
    'common.error': 'లోపం',
    'common.warning': 'హెచ్చరిక',
    'common.info': 'సమాచారం',
  },
  bn: {
    'nav.home': 'হোম',
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.reports': 'রিপোর্ট',
    'nav.appointments': 'অ্যাপয়েন্টমেন্ট',
    'nav.newConsultation': 'নতুন পরামর্শ',
    'home.welcome': 'আবার স্বাগতম',
    'home.startConsultation': 'পরামর্শ শুরু করুন',
    'common.loading': 'লোড হচ্ছে...',
    'common.save': 'সংরক্ষণ করুন',
    'common.cancel': 'বাতিল করুন',
    'common.delete': 'মুছুন',
    'common.edit': 'সম্পাদনা করুন',
    'common.close': 'বন্ধ করুন',
    'common.back': 'পিছনে',
    'common.submit': 'জমা দিন',
    'common.confirm': 'নিশ্চিত করুন',
    'common.success': 'সফল',
    'common.error': 'ত্রুটি',
    'common.warning': 'সতর্কতা',
    'common.info': 'তথ্য',
  },
  mr: {
    'nav.home': 'मुख्यपृष्ठ',
    'nav.dashboard': 'डॅशबोर्ड',
    'nav.reports': 'अहवाल',
    'nav.appointments': 'भेटी',
    'nav.newConsultation': 'नवीन सल्लामसलत',
    'home.welcome': 'पुन्हा स्वागत आहे',
    'home.startConsultation': 'सल्लामसलत सुरू करा',
    'common.loading': 'लोड होत आहे...',
    'common.save': 'जतन करा',
    'common.cancel': 'रद्द करा',
    'common.delete': 'हटवा',
    'common.edit': 'संपादित करा',
    'common.close': 'बंद करा',
    'common.back': 'मागे',
    'common.submit': 'सबमिट करा',
    'common.confirm': 'पुष्टी करा',
    'common.success': 'यश',
    'common.error': 'त्रुटी',
    'common.warning': 'चेतावणी',
    'common.info': 'माहिती',
  },
  gu: {
    'nav.home': 'હોમ',
    'nav.dashboard': 'ડેશબોર્ડ',
    'nav.reports': 'રિપોર્ટ્સ',
    'nav.appointments': 'એપોઇન્ટમેન્ટ્સ',
    'nav.newConsultation': 'નવી પરામર્શ',
    'home.welcome': 'પાછા સ્વાગત છે',
    'home.startConsultation': 'પરામર્શ શરૂ કરો',
    'common.loading': 'લોડ થઈ રહ્યું છે...',
    'common.save': 'સાચવો',
    'common.cancel': 'રદ કરો',
    'common.delete': 'કાઢો',
    'common.edit': 'સંપાદિત કરો',
    'common.close': 'બંધ કરો',
    'common.back': 'પાછળ',
    'common.submit': 'સબમિટ કરો',
    'common.confirm': 'પુષ્ટિ કરો',
    'common.success': 'સફળતા',
    'common.error': 'ભૂલ',
    'common.warning': 'ચેતવણી',
    'common.info': 'માહિતી',
  },
  kn: {
    'nav.home': 'ಮುಖಪುಟ',
    'nav.dashboard': 'ಡ್ಯಾಶ್ಬೋರ್ಡ್',
    'nav.reports': 'ವರದಿಗಳು',
    'nav.appointments': 'ಭೇಟಿಗಳು',
    'nav.newConsultation': 'ಹೊಸ ಸಮಾಲೋಚನೆ',
    'home.welcome': 'ಮತ್ತೆ ಸ್ವಾಗತ',
    'home.startConsultation': 'ಸಮಾಲೋಚನೆ ಪ್ರಾರಂಭಿಸಿ',
    'common.loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    'common.save': 'ಉಳಿಸಿ',
    'common.cancel': 'ರದ್ದುಮಾಡು',
    'common.delete': 'ಅಳಿಸು',
    'common.edit': 'ಸಂಪಾದಿಸು',
    'common.close': 'ಮುಚ್ಚಿ',
    'common.back': 'ಹಿಂದೆ',
    'common.submit': 'ಸಲ್ಲಿಸು',
    'common.confirm': 'ದೃಢೀಕರಿಸು',
    'common.success': 'ಯಶಸ್ಸು',
    'common.error': 'ದೋಷ',
    'common.warning': 'ಎಚ್ಚರಿಕೆ',
    'common.info': 'ಮಾಹಿತಿ',
  },
  ml: {
    'nav.home': 'ഹോം',
    'nav.dashboard': 'ഡാഷ്ബോർഡ്',
    'nav.reports': 'റിപ്പോർട്ടുകൾ',
    'nav.appointments': 'അപ്പോയിൻ്റ്മെൻ്റുകൾ',
    'nav.newConsultation': 'പുതിയ കൺസൾട്ടേഷൻ',
    'home.welcome': 'തിരികെ സ്വാഗതം',
    'home.startConsultation': 'കൺസൾട്ടേഷൻ ആരംഭിക്കുക',
    'common.loading': 'ലോഡ് ചെയ്യുന്നു...',
    'common.save': 'സംരക്ഷിക്കുക',
    'common.cancel': 'റദ്ദാക്കുക',
    'common.delete': 'ഇല്ലാതാക്കുക',
    'common.edit': 'എഡിറ്റ് ചെയ്യുക',
    'common.close': 'അടയ്ക്കുക',
    'common.back': 'പിന്നിലേക്ക്',
    'common.submit': 'സമർപ്പിക്കുക',
    'common.confirm': 'സ്ഥിരീകരിക്കുക',
    'common.success': 'വിജയം',
    'common.error': 'പിശക്',
    'common.warning': 'മുന്നറിയിപ്പ്',
    'common.info': 'വിവരം',
  },
  pa: {
    'nav.home': 'ਹੋਮ',
    'nav.dashboard': 'ਡੈਸ਼ਬੋਰਡ',
    'nav.reports': 'ਰਿਪੋਰਟਾਂ',
    'nav.appointments': 'ਅਪੋਇੰਟਮੈਂਟਾਂ',
    'nav.newConsultation': 'ਨਵਾਂ ਸਲਾਹ-ਮਸ਼ਵਰਾ',
    'home.welcome': 'ਵਾਪਸ ਸਵਾਗਤ ਹੈ',
    'home.startConsultation': 'ਸਲਾਹ-ਮਸ਼ਵਰਾ ਸ਼ੁਰੂ ਕਰੋ',
    'common.loading': 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
    'common.save': 'ਸੇਵ ਕਰੋ',
    'common.cancel': 'ਰੱਦ ਕਰੋ',
    'common.delete': 'ਹਟਾਓ',
    'common.edit': 'ਸੰਪਾਦਿਤ ਕਰੋ',
    'common.close': 'ਬੰਦ ਕਰੋ',
    'common.back': 'ਪਿੱਛੇ',
    'common.submit': 'ਜਮ੍ਹਾਂ ਕਰੋ',
    'common.confirm': 'ਪੁਸ਼ਟੀ ਕਰੋ',
    'common.success': 'ਸਫਲਤਾ',
    'common.error': 'ਗਲਤੀ',
    'common.warning': 'ਚੇਤਾਵਨੀ',
    'common.info': 'ਜਾਣਕਾਰੀ',
  },
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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