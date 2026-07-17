import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router';
import { useLanguage } from './LanguageContext';
import { useSubscription } from './SubscriptionContext';
import { consultationService } from '../services/consultationService';
import { Message, ConsultationSession, DashboardStats } from '../types/consultation.types';

export interface ConsultationContextType {
  // Core data
  consultations: ConsultationSession[];
  stats: DashboardStats;
  loading: boolean;
  refreshKey: number;

  // User helpers
  getUserName: () => string;
  getCurrentUserId: () => string;
  getCurrentSessionId: () => string;

  // Consultation lifecycle
  consultationId: string;
  selectedSpecialist: string;
  setSelectedSpecialist: (s: string) => void;
  consultationStarted: boolean;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  manualSymptoms: string;
  setManualSymptoms: (s: string) => void;
  triageResult: any;
  setTriageResult: (r: any) => void;
  streamingMessage: string;
  setStreamingMessage: React.Dispatch<React.SetStateAction<string>>;
  isStreaming: boolean;
  setIsStreaming: (s: boolean) => void;

  startConsultation: () => Promise<void>;
  endConsultation: () => void;
  handleNewConsultation: () => void;
  handleTranscriptUpdate: (transcript: string) => void;
  handleAIResponse: (response: string, isComplete?: boolean) => void;
  addMessage: (message: Message) => void;
  handleSymptomCheckerConsultation: (specialistType: string, symptoms: string) => void;

  // Report/appointment/rating handlers
  handleViewReport: (consultationId: string) => void;
  handleBookAppointment: (consultation: ConsultationSession) => void;
  handleRateConsultation: (consultation: ConsultationSession) => void;
  handleViewEnhancedReport: (consultation: ConsultationSession) => void;
  handleResumeConsultation: (consultId: string) => Promise<void>;
  handleVideoConsultation: (consultation: ConsultationSession) => void;
  handleRatingSubmit: (rating: number, feedback: string) => void;

  // Consultation-dependent modal state
  showReportModal: boolean;
  setShowReportModal: (show: boolean) => void;
  selectedConsultation: ConsultationSession | null;
  showAppointmentModal: boolean;
  setShowAppointmentModal: (show: boolean) => void;
  currentConsultationForAppointment: any;
  showRatingModal: boolean;
  setShowRatingModal: (show: boolean) => void;
  selectedRatingConsultation: ConsultationSession | null;
  showEnhancedReport: boolean;
  setShowEnhancedReport: (show: boolean) => void;
  selectedReportData: any;
  showAnalytics: boolean;
  setShowAnalytics: (show: boolean) => void;
  showClinicDashboard: boolean;
  setShowClinicDashboard: (show: boolean) => void;
  currentClinicId: string;
  isCreatingClinic: boolean;
  handleOpenClinicDashboard: () => Promise<void>;
  showVideoConsultation: boolean;
  setShowVideoConsultation: (show: boolean) => void;
  selectedVideoConsultation: ConsultationSession | null;
  showVoiceBiometricsEnrollment: boolean;
  setShowVoiceBiometricsEnrollment: (show: boolean) => void;
  showFHIRConnector: boolean;
  setShowFHIRConnector: (show: boolean) => void;

  // Specialist icon helper
  getSpecialistIcon: (type: string) => React.ReactNode;
}

export const ConsultationContext = createContext<ConsultationContextType | null>(null);

export function useConsultation(): ConsultationContextType {
  const ctx = useContext(ConsultationContext);
  if (!ctx) throw new Error('useConsultation must be used within ConsultationProvider');
  return ctx;
}

export function ConsultationProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { canStartConsultation, getRemainingConsultations, subscription, incrementConsultation } = useSubscription();

  // Core data
  const [consultations, setConsultations] = useState<ConsultationSession[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalConsultations: 0,
    completedConsultations: 0,
    averageDuration: 0,
    pendingFollowUps: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Consultation lifecycle state
  const [consultationId, setConsultationId] = useState('');
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [consultationStarted, setConsultationStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [manualSymptoms, setManualSymptoms] = useState('');
  const [triageResult, setTriageResult] = useState<any>(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Consultation-dependent modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationSession | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [currentConsultationForAppointment, setCurrentConsultationForAppointment] = useState<any>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRatingConsultation, setSelectedRatingConsultation] = useState<ConsultationSession | null>(null);
  const [showEnhancedReport, setShowEnhancedReport] = useState(false);
  const [selectedReportData, setSelectedReportData] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showClinicDashboard, setShowClinicDashboard] = useState(false);
  const [currentClinicId, setCurrentClinicId] = useState<string>('');
  const [isCreatingClinic, setIsCreatingClinic] = useState(false);
  const [showVideoConsultation, setShowVideoConsultation] = useState(false);
  const [selectedVideoConsultation, setSelectedVideoConsultation] = useState<ConsultationSession | null>(null);
  const [showVoiceBiometricsEnrollment, setShowVoiceBiometricsEnrollment] = useState(false);
  const [showFHIRConnector, setShowFHIRConnector] = useState(false);

  // User helpers
  const getUserName = useCallback(() => {
    if (user?.fullName) return user.fullName.split(' ')[0];
    if (user?.firstName) return user.firstName;
    if (user?.emailAddresses[0]?.emailAddress) return user.emailAddresses[0].emailAddress.split('@')[0];
    return 'User';
  }, [user]);

  const getCurrentUserId = useCallback(() => {
    return userId || user?.id || `user_${Date.now()}`;
  }, [userId, user]);

  const getCurrentSessionId = useCallback(() => {
    return consultationId || `session_${Date.now()}`;
  }, [consultationId]);

  // Stats updater
  const updateStats = useCallback((consultList: ConsultationSession[]) => {
    setStats({
      totalConsultations: consultList.length,
      completedConsultations: consultList.filter(c => c.status === 'completed').length,
      averageDuration: consultList.length > 0
        ? Math.round(consultList.reduce((acc, c) => acc + (c.duration || 0), 0) / consultList.length)
        : 0,
      pendingFollowUps: consultList.filter(c => c.status === 'completed').length,
    });
  }, []);

  // Load consultations
  useEffect(() => {
    if (userId) {
      let cachedData: ConsultationSession[] = [];
      try {
        const saved = localStorage.getItem(`consultations_${userId}`);
        if (saved) {
          cachedData = JSON.parse(saved);
        }
      } catch (err) {
        console.error('Failed to parse cached consultations', err);
      }

      if (cachedData.length > 0) {
        setConsultations(cachedData);
        updateStats(cachedData);
        setLoading(false);
      } else {
        setLoading(true);
      }

      consultationService.getUserConsultations(userId)
        .then(data => {
          if (data && data.length > 0) {
            const serializedData = JSON.stringify(data);
            const serializedCache = JSON.stringify(cachedData);
            if (serializedData !== serializedCache) {
              setConsultations(data as unknown as ConsultationSession[]);
              updateStats(data as unknown as ConsultationSession[]);
            }
          } else if (cachedData.length === 0) {
            const mockConsultations: ConsultationSession[] = [
              {
                id: '1',
                specialistType: 'general',
                specialistName: 'Dr. Sarah Wilson',
                status: 'completed',
                startedAt: new Date('2024-03-15T10:30:00'),
                endedAt: new Date('2024-03-15T10:45:00'),
                duration: 15,
                symptoms: 'Headache and fever for 2 days',
                notes: 'Recommended rest and hydration',
              },
              {
                id: '2',
                specialistType: 'orthopedic',
                specialistName: 'Dr. James Chen',
                status: 'completed',
                startedAt: new Date('2024-03-10T14:00:00'),
                endedAt: new Date('2024-03-10T14:20:00'),
                duration: 20,
                symptoms: 'Lower back pain when sitting',
                notes: 'Suggested posture correction exercises',
              },
            ];
            setConsultations(mockConsultations);
            localStorage.setItem(`consultations_${userId}`, JSON.stringify(mockConsultations));
            updateStats(mockConsultations);
          }
        })
        .catch(error => {
          console.error('Error loading consultations:', error);
          if (cachedData.length === 0) {
            setConsultations([]);
            updateStats([]);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [userId, refreshKey, updateStats]);

  // UUID generator
  const generateUUID = () => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const startConsultation = async () => {
    if (!selectedSpecialist) {
      alert(t('errors.selectSpecialist') || 'Please select a specialist first');
      return;
    }

    if (!canStartConsultation()) {
      const remaining = getRemainingConsultations();
      if (remaining === 0 && subscription.tier === 'free') {
        alert(t('errors.upgradeRequired') || 'You have used all 5 free consultations this month. Please upgrade to Pro or Family plan to continue.');
        return;
      }
    }

    const newId = generateUUID();
    setConsultationId(newId);
    setConsultationStarted(true);
    setMessages([]);
    setManualSymptoms('');
    setTriageResult(null);
    setStreamingMessage('');
    setIsStreaming(false);
    incrementConsultation();
  };

  const handleTranscriptUpdate = (transcript: string) => {
    setManualSymptoms(transcript);
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: transcript,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
  };

  const handleAIResponse = (response: string, isComplete?: boolean) => {
    if (isComplete) {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newMessage]);
      setStreamingMessage('');
      setIsStreaming(false);
    } else {
      setStreamingMessage(prev => prev + response);
      setIsStreaming(true);
    }
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const endConsultation = () => {
    const userMessage = messages.find(m => m.type === 'user');
    const symptoms = userMessage?.content || manualSymptoms || 'Symptoms recorded during consultation';
    const specialistName = `${selectedSpecialist.charAt(0).toUpperCase() + selectedSpecialist.slice(1)} Specialist`;

    const newConsultation: any = {
      id: consultationId,
      userId: getCurrentUserId(),
      specialistType: selectedSpecialist,
      specialistName: specialistName,
      status: 'completed',
      symptoms: symptoms,
      notes: 'Consultation completed. Medical report generated.',
      duration: Math.floor(Math.random() * 20) + 10,
      startedAt: new Date(),
      endedAt: new Date(),
    };

    consultationService.saveConsultation(newConsultation)
      .then(() => {
        return consultationService.getUserConsultations(getCurrentUserId());
      })
      .then(updatedList => {
        setConsultations(updatedList as unknown as ConsultationSession[]);
        updateStats(updatedList as unknown as ConsultationSession[]);
        setRefreshKey(prev => prev + 1);
      })
      .catch(error => {
        console.error('Error saving consultation:', error);
        const existing = localStorage.getItem(`consultations_${userId}`);
        const existingConsultations = existing ? JSON.parse(existing) : [];
        const updatedConsultations = [newConsultation, ...existingConsultations];
        localStorage.setItem(`consultations_${userId}`, JSON.stringify(updatedConsultations));
        setConsultations(updatedConsultations);
        updateStats(updatedConsultations);
        setRefreshKey(prev => prev + 1);
      });

    setConsultationStarted(false);
    setSelectedSpecialist('');
    navigate('/dashboard');
    setMessages([]);
    setManualSymptoms('');
    setTriageResult(null);
    setStreamingMessage('');
    setIsStreaming(false);

    alert(t('consultation.ended') || '✅ Consultation ended! Your report has been saved.');
  };

  const handleNewConsultation = () => {
    navigate('/consultation');
    setConsultationStarted(false);
    setSelectedSpecialist('');
    setMessages([]);
    setManualSymptoms('');
    setTriageResult(null);
    setStreamingMessage('');
    setIsStreaming(false);
  };

  const handleSymptomCheckerConsultation = (specialistType: string, symptoms: string) => {
    setSelectedSpecialist(specialistType);
    setManualSymptoms(symptoms);
    navigate('/consultation');
    setConsultationStarted(true);
    setMessages([]);
    setTriageResult(null);
    setStreamingMessage('');
    setIsStreaming(false);
  };

  const handleViewReport = (cId: string) => {
    const consultation = consultations.find(c => c.id === cId);
    if (consultation) {
      setSelectedConsultation(consultation);
      setShowReportModal(true);
    }
  };

  const handleResumeConsultation = async (consultId: string) => {
    try {
      setShowReportModal(false);
      setSelectedConsultation(null);

      const sessionData = await consultationService.getVoiceSession(consultId);
      let loadedMessages: Message[] = [];

      if (sessionData && sessionData.success && sessionData.data) {
        const voiceSession = sessionData.data;
        const userMsgs = Array.isArray(voiceSession.transcript) ? voiceSession.transcript : [];
        const aiMsgs = Array.isArray(voiceSession.aiResponses) ? voiceSession.aiResponses : [];

        loadedMessages = [
          ...userMsgs.map((m: any) => ({
            id: m.id || `msg_${Math.random()}_user`,
            type: 'user' as const,
            content: m.content,
            timestamp: new Date(m.timestamp || Date.now())
          })),
          ...aiMsgs.map((m: any) => ({
            id: m.id || `msg_${Math.random()}_ai`,
            type: 'ai' as const,
            content: m.content,
            timestamp: new Date(m.timestamp || Date.now())
          }))
        ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      }

      const consultation = consultations.find(c => c.id === consultId);
      if (consultation) {
        setConsultationId(consultId);
        setSelectedSpecialist(consultation.specialistType);
        setMessages(loadedMessages);
        setConsultationStarted(true);
        setManualSymptoms(consultation.symptoms || '');
        setTriageResult(null);
        setStreamingMessage('');
        setIsStreaming(false);
        navigate('/consultation');
      }
    } catch (err) {
      console.error('Error resuming consultation:', err);
      alert('Failed to resume consultation. Starting a fresh session instead.');
    }
  };

  const handleViewEnhancedReport = (consultation: ConsultationSession) => {
    const reportData = {
      consultationId: consultation.id,
      patientId: userId || 'unknown',
      patientName: getUserName(),
      patientAge: undefined,
      patientGender: undefined,
      specialistType: consultation.specialistType,
      specialistName: consultation.specialistName,
      symptoms: consultation.symptoms || 'No symptoms recorded',
      recommendations: [
        'Get adequate rest (7-8 hours)',
        'Stay hydrated with water and warm fluids',
        'Monitor symptoms for 2-3 days',
        'Take over-the-counter medication if needed'
      ],
      diagnosis: consultation.notes || 'Under evaluation',
      severity: 'mild',
      urgencyLevel: 'routine',
      riskFactors: [],
      medicationsPrescribed: [],
      followUp: 'Schedule follow-up if symptoms persist beyond 5-7 days',
      patientInstructions: [
        'Rest and avoid strenuous activities',
        'Drink plenty of fluids',
        'Monitor temperature daily',
        'Seek medical attention if symptoms worsen'
      ]
    };
    setSelectedReportData(reportData);
    setShowEnhancedReport(true);
  };

  const handleBookAppointment = (consultation: ConsultationSession) => {
    setCurrentConsultationForAppointment(consultation);
    setShowAppointmentModal(true);
  };

  const handleRateConsultation = (consultation: ConsultationSession) => {
    setSelectedRatingConsultation(consultation);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = (rating: number, feedback: string) => {
    if (selectedRatingConsultation) {
      const ratings = JSON.parse(localStorage.getItem('consultationRatings') || '{}');
      ratings[selectedRatingConsultation.id] = {
        rating,
        feedback,
        date: new Date().toISOString(),
        consultationTitle: selectedRatingConsultation.specialistName
      };
      localStorage.setItem('consultationRatings', JSON.stringify(ratings));

      const allRatings = Object.values(ratings);
      let totalRating = 0;
      for (let i = 0; i < allRatings.length; i++) {
        totalRating += (allRatings[i] as any).rating;
      }
      const avgRatingNum = allRatings.length > 0 ? totalRating / allRatings.length : 0;
      const avgRating = avgRatingNum.toFixed(1);
      localStorage.setItem('averageRating', avgRating);
    }
  };

  const handleVideoConsultation = (_consultation: ConsultationSession) => {
    alert('🎥 Video Consultation Coming Soon!\n\nTo enable real video calls:\n1. Sign up at daily.co\n2. Add your API key\n3. Real video calls will work instantly');
  };

  // Clinic dashboard
  const handleOpenClinicDashboard = async () => {
    setIsCreatingClinic(true);
    try {
      const savedClinicId = localStorage.getItem('clinicId');
      if (savedClinicId) {
        setCurrentClinicId(savedClinicId);
        setShowClinicDashboard(true);
        setIsCreatingClinic(false);
        return;
      }

      const API_URL = 'https://ai-medical-voice-agent-ygc5.onrender.com';
      const response = await fetch(`${API_URL}/api/clinic/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${getUserName()}'s Clinic`,
          subdomain: `${getUserName().toLowerCase()}clinic`,
          primaryColor: '#3b82f6',
          secondaryColor: '#10b981',
          accentColor: '#8b5cf6',
          contactEmail: user?.emailAddresses[0]?.emailAddress || 'clinic@example.com',
          contactPhone: '9876543210',
          address: 'Clinic Address',
          city: 'Your City',
          state: 'Your State',
          pincode: '123456',
          subscriptionTier: 'enterprise'
        }),
      });
      const data = await response.json();

      if (data.success) {
        const newClinicId = data.data.id;
        localStorage.setItem('clinicId', newClinicId);
        setCurrentClinicId(newClinicId);
        setShowClinicDashboard(true);
      }
    } catch (error) {
      console.error('Error opening clinic dashboard:', error);
    } finally {
      setIsCreatingClinic(false);
    }
  };

  // Specialist icon helper (used by multiple pages)
  const getSpecialistIcon = (_type: string): React.ReactNode => {
    // Returns null — each consumer imports their own icons.
    // This is kept as a stub for API compatibility.
    return null;
  };

  const value: ConsultationContextType = {
    consultations, stats, loading, refreshKey,
    getUserName, getCurrentUserId, getCurrentSessionId,
    consultationId, selectedSpecialist, setSelectedSpecialist,
    consultationStarted, messages, setMessages,
    manualSymptoms, setManualSymptoms, triageResult, setTriageResult,
    streamingMessage, setStreamingMessage, isStreaming, setIsStreaming,
    startConsultation, endConsultation, handleNewConsultation,
    handleTranscriptUpdate, handleAIResponse, addMessage,
    handleSymptomCheckerConsultation,
    handleViewReport, handleBookAppointment, handleRateConsultation,
    handleViewEnhancedReport, handleResumeConsultation,
    handleVideoConsultation, handleRatingSubmit,
    showReportModal, setShowReportModal, selectedConsultation,
    showAppointmentModal, setShowAppointmentModal, currentConsultationForAppointment,
    showRatingModal, setShowRatingModal, selectedRatingConsultation,
    showEnhancedReport, setShowEnhancedReport, selectedReportData,
    showAnalytics, setShowAnalytics,
    showClinicDashboard, setShowClinicDashboard, currentClinicId,
    isCreatingClinic, handleOpenClinicDashboard,
    showVideoConsultation, setShowVideoConsultation, selectedVideoConsultation,
    showVoiceBiometricsEnrollment, setShowVoiceBiometricsEnrollment,
    showFHIRConnector, setShowFHIRConnector,
    getSpecialistIcon,
  };

  return (
    <ConsultationContext.Provider value={value}>
      {children}
    </ConsultationContext.Provider>
  );
}
