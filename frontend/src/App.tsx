import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { 
  Home, LayoutDashboard, FileText, Calendar, Plus, Mic, Stethoscope,
  ClipboardList, ArrowRight, Download, X, Activity, Brain, Heart, Bone, Baby,
  Sparkles, MessageCircle, Clock, CheckCircle, Star, Mail, Shield, Bell,
  TrendingUp, Building2
} from 'lucide-react';
import AuthGuard from './components/AuthGuard';
import Header from './components/Header';
import SymptomChecker from './components/SymptomChecker';
import HealthTips from './components/HealthTips';
import EmergencyContacts from './components/EmergencyContacts';
import ConsultationRating from './components/ConsultationRating';
import HealthGoals from './components/HealthGoals';
import VoiceCustomization from './components/VoiceCustomization';
import ProgressDashboard from './components/ProgressDashboard';
import TwoFactorAuth from './components/TwoFactorAuth';
import DataExport from './components/DataExport';
import VideoConsultation from './components/VideoConsultation';
import EnhancedDashboard from './components/EnhancedDashboard';
import SpecialistSelector from './components/SpecialistSelector';
import VoiceRecorder from './components/VoiceRecorder';
import ChatMessages from './components/ChatMessages';
import ConsultationHistory from './components/ConsultationHistory';
import MedicalReportModal from './components/MedicalReportModal';
import AppointmentBooking from './components/AppointmentBooking';
import MyAppointments from './components/MyAppointments';
import Footer from './components/Footer';
import PricingPlans from './components/PricingPlans';
import SkeletonLoader from './components/SkeletonLoader';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import TermsConditions from './pages/TermsConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import VoiceConsultationPage from './pages/VoiceConsultation';
import MedicationReminder from './components/MedicationReminder';
import EnhancedReportViewer from './components/EnhancedReportViewer';
import DoctorAnalyticsDashboard from './components/DoctorAnalyticsDashboard';
import ClinicDashboard from './components/ClinicDashboard';
import EnhancedSymptomChecker from './components/EnhancedSymptomChecker';
import { useLanguage } from './context/LanguageContext';
import { useSubscription } from './context/SubscriptionContext';
import { consultationService } from './services/consultationService';
import { Message, ConsultationSession, DashboardStats } from './types/consultation.types';
import HIPAACompliance from './pages/HIPAACompliance';
import CookiePolicy from './pages/CookiePolicy';

function AppContent() {
  const { userId, getToken } = useAuth();
  const { user } = useUser();

  // Set up global request interceptors for auth tokens
  useEffect(() => {
    // 1. Axios request interceptor
    const axiosInterceptor = axios.interceptors.request.use(async (config) => {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error('Failed to attach token to Axios request', err);
      }
      return config;
    });

    // 2. Global fetch interceptor
    const originalFetch = window.fetch;
    window.fetch = async function (input, init) {
      try {
        const token = await getToken();
        if (token) {
          init = init || {};
          init.headers = {
            ...init.headers,
            'Authorization': `Bearer ${token}`,
          };
        }
      } catch (err) {
        console.error('Failed to attach token to fetch request', err);
      }
      return originalFetch(input, init);
    };

    return () => {
      axios.interceptors.request.eject(axiosInterceptor);
      window.fetch = originalFetch;
    };
  }, [getToken]);

  const { t, language } = useLanguage();
  const { canStartConsultation, getRemainingConsultations, subscription, incrementConsultation } = useSubscription();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [consultationId, setConsultationId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [consultationStarted, setConsultationStarted] = useState(false);
  const [consultations, setConsultations] = useState<ConsultationSession[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationSession | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showAppointmentsList, setShowAppointmentsList] = useState(false);
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const [showHealthTips, setShowHealthTips] = useState(false);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showHealthGoals, setShowHealthGoals] = useState(false);
  const [showVoiceCustomization, setShowVoiceCustomization] = useState(false);
  const [showProgressDashboard, setShowProgressDashboard] = useState(false);
  const [showTwoFactorAuth, setShowTwoFactorAuth] = useState(false);
  const [showDataExport, setShowDataExport] = useState(false);
  const [showVideoConsultation, setShowVideoConsultation] = useState(false);
  const [selectedVideoConsultation, setSelectedVideoConsultation] = useState<ConsultationSession | null>(null);
  const [selectedRatingConsultation, setSelectedRatingConsultation] = useState<ConsultationSession | null>(null);
  const [currentConsultationForAppointment, setCurrentConsultationForAppointment] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [manualSymptoms, setManualSymptoms] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPricing, setShowPricing] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [currentLegalPage, setCurrentLegalPage] = useState<string | null>(null);
  const [currentServicePage, setCurrentServicePage] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalConsultations: 0,
    completedConsultations: 0,
    averageDuration: 0,
    pendingFollowUps: 0,
  });
  const [triageResult, setTriageResult] = useState<any>(null);
  
  // Streaming states
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Reminder states
  const [showReminders, setShowReminders] = useState(false);
  
  // Enhanced Report states
  const [showEnhancedReport, setShowEnhancedReport] = useState(false);
  const [selectedReportData, setSelectedReportData] = useState<any>(null);
  
  // Analytics Dashboard state
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Clinic Dashboard states
  const [showClinicDashboard, setShowClinicDashboard] = useState(false);
  const [currentClinicId, setCurrentClinicId] = useState<string>('');
  const [isCreatingClinic, setIsCreatingClinic] = useState(false);
  
  // Enhanced Symptom Checker state
  const [showEnhancedSymptomChecker, setShowEnhancedSymptomChecker] = useState(false);

  // Get current session ID
  const getCurrentSessionId = () => {
    return consultationId || `session_${Date.now()}`;
  };

  // Get current user ID from Clerk
  const getCurrentUserId = () => {
    return userId || user?.id || `user_${Date.now()}`;
  };

  // Function to open clinic dashboard
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

  useEffect(() => {
    if (userId) {
      setLoading(true);
      consultationService.getUserConsultations(userId)
        .then(data => {
          if (data && data.length > 0) {
            setConsultations(data as unknown as ConsultationSession[]);
            updateStats(data as unknown as ConsultationSession[]);
          } else {
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
            // Save mock data locally for write-through fallback
            localStorage.setItem(`consultations_${userId}`, JSON.stringify(mockConsultations));
            updateStats(mockConsultations);
          }
        })
        .catch(error => {
          console.error('Error loading consultations:', error);
          setConsultations([]);
          updateStats([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [userId, refreshKey]);

  const updateStats = (consultList: ConsultationSession[]) => {
    setStats({
      totalConsultations: consultList.length,
      completedConsultations: consultList.filter(c => c.status === 'completed').length,
      averageDuration: consultList.length > 0 
        ? Math.round(consultList.reduce((acc, c) => acc + (c.duration || 0), 0) / consultList.length)
        : 0,
      pendingFollowUps: consultList.filter(c => c.status === 'completed').length,
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
        setShowPricing(true);
        return;
      }
    }

    const newId = `consult_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
        // Fetch latest list from DB/cache to update state
        return consultationService.getUserConsultations(getCurrentUserId());
      })
      .then(updatedList => {
        setConsultations(updatedList as unknown as ConsultationSession[]);
        updateStats(updatedList as unknown as ConsultationSession[]);
        setRefreshKey(prev => prev + 1);
      })
      .catch(error => {
        console.error('Error saving consultation:', error);
        // Fallback local update
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
    setCurrentPage('dashboard');
    setMessages([]);
    setManualSymptoms('');
    setTriageResult(null);
    setStreamingMessage('');
    setIsStreaming(false);
    
    alert(t('consultation.ended') || '✅ Consultation ended! Your report has been saved.');
  };

  const handleViewReport = (consultationId: string) => {
    const consultation = consultations.find(c => c.id === consultationId);
    if (consultation) {
      setSelectedConsultation(consultation);
      setShowReportModal(true);
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

  const handleNewConsultation = () => {
    setCurrentPage('consultation');
    setConsultationStarted(false);
    setSelectedSpecialist('');
    setMessages([]);
    setManualSymptoms('');
    setTriageResult(null);
    setStreamingMessage('');
    setIsStreaming(false);
    setShowReminders(false);
  };

  const handleSymptomCheckerConsultation = (specialistType: string, symptoms: string) => {
    setSelectedSpecialist(specialistType);
    setManualSymptoms(symptoms);
    setCurrentPage('consultation');
    setConsultationStarted(true);
    setMessages([]);
    setTriageResult(null);
    setStreamingMessage('');
    setIsStreaming(false);
    setShowReminders(false);
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

  const handleVideoConsultation = (consultation: ConsultationSession) => {
    alert('🎥 Video Consultation Coming Soon!\n\nTo enable real video calls:\n1. Sign up at daily.co\n2. Add your API key\n3. Real video calls will work instantly');
  };

  const handleOpenReminders = () => {
    setCurrentPage('');
    setShowReminders(true);
    setShowSymptomChecker(false);
    setShowHealthTips(false);
    setShowEmergencyContacts(false);
    setShowHealthGoals(false);
    setShowVoiceCustomization(false);
    setShowProgressDashboard(false);
    setShowDataExport(false);
    setShowTwoFactorAuth(false);
    setShowAppointmentsList(false);
    setCurrentLegalPage(null);
    setCurrentServicePage(null);
    setShowPricing(false);
    setShowReportModal(false);
    setShowAppointmentModal(false);
    setShowRatingModal(false);
    setShowVideoConsultation(false);
  };

  const getUserName = () => {
    if (user?.fullName) return user.fullName.split(' ')[0];
    if (user?.firstName) return user.firstName;
    if (user?.emailAddresses[0]?.emailAddress) return user.emailAddresses[0].emailAddress.split('@')[0];
    return 'User';
  };

  const getSpecialistIcon = (type: string) => {
    switch(type) {
      case 'general': return <Stethoscope size={18} />;
      case 'orthopedic': return <Bone size={18} />;
      case 'cardiologist': return <Heart size={18} />;
      case 'neurologist': return <Brain size={18} />;
      case 'pediatrician': return <Baby size={18} />;
      default: return <Activity size={18} />;
    }
  };

  const handleFooterNavigation = (page: string) => {
    setCurrentLegalPage(null);
    setCurrentServicePage(null);
    setCurrentPage('');
    setShowReminders(false);
    if (page === 'about') setCurrentLegalPage('about');
    else if (page === 'contact') setCurrentLegalPage('contact');
    else if (page === 'terms') setCurrentLegalPage('terms');
    else if (page === 'privacy') setCurrentLegalPage('privacy');
    else if (page === 'hipaa') setCurrentLegalPage('hipaa');
    else if (page === 'cookies') setCurrentLegalPage('cookies');
    else if (page === 'consultation') setCurrentPage('consultation');
    else if (page === 'dashboard') setCurrentPage('dashboard');
    else if (page === 'reports') setCurrentPage('reports');
    else if (page === 'home') setCurrentPage('home');
    else if (page === 'reminders') handleOpenReminders();
    window.scrollTo(0, 0);
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (currentLegalPage === 'about') return <AboutUs />;
  if (currentLegalPage === 'contact') return <ContactUs />;
  if (currentLegalPage === 'terms') return <TermsConditions />;
  if (currentLegalPage === 'privacy') return <PrivacyPolicy />;
  if (currentServicePage === 'voice-consultation') return <VoiceConsultationPage />;
  if (currentLegalPage === 'hipaa') return <HIPAACompliance />;
  if (currentLegalPage === 'cookies') return <CookiePolicy />;

  return (
    <AuthGuard>
      <div style={{...styles.app, paddingTop: '0px' }}>
        <Header
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          setShowSymptomChecker={setShowEnhancedSymptomChecker}
          setShowHealthTips={setShowHealthTips}
          setShowEmergencyContacts={setShowEmergencyContacts}
          setShowHealthGoals={setShowHealthGoals}
          setShowVoiceCustomization={setShowVoiceCustomization}
          setShowProgressDashboard={setShowProgressDashboard}
          setShowDataExport={setShowDataExport}
          setShowTwoFactorAuth={setShowTwoFactorAuth}
          setShowAppointmentsList={setShowAppointmentsList}
          onNewConsultation={handleNewConsultation}
          onUpgrade={() => setShowPricing(true)}
          onOpenReminders={handleOpenReminders}
          userName={getUserName()}
        />

        {currentPage !== 'home' && currentPage !== '' && !showReminders && (
          <div style={styles.pageNav}>
            <button onClick={() => setCurrentPage('home')} style={styles.pageNavButton}>
              ← {t('common.back')} {t('nav.home')}
            </button>
            <span style={styles.pageNavTitle}>
              {currentPage === 'dashboard' && t('nav.dashboard')}
              {currentPage === 'consultation' && t('consultation.title')}
              {currentPage === 'reports' && t('reports.title')}
            </span>
          </div>
        )}

        {currentPage === 'home' && (
          <div style={styles.homeContainer}>
            {/* Hero Section - IMPROVED */}
            <div style={styles.heroSection}>
              <div style={styles.heroContent}>
                <div style={styles.heroBadge}>
                  <Sparkles size={16} />
                  <span>{t('home.aiPowered')}</span>
                </div>
                <h1 style={styles.heroTitle}>
                  {t('home.yourHealth')}<br />
                  <span style={styles.heroTitleAccent}>{t('home.ourPriority')}</span>
                </h1>
                <p style={styles.heroSubtitle}>
                  {t('home.subtitle')}
                </p>
                <div style={styles.heroButtons}>
                  <button onClick={() => setCurrentPage('consultation')} style={styles.primaryButton}>
                    {t('home.startConsultation')}
                    <ArrowRight size={18} />
                  </button>
                  <button onClick={() => setShowEnhancedSymptomChecker(true)} style={styles.secondaryButton}>
                    {t('home.checkSymptoms')}
                  </button>
                </div>
              </div>
              <div style={styles.heroImage}>
                <div style={styles.floatingCard1}>
                  <Mic size={24} color="#3b82f6" />
                  <span>{t('home.voiceConsultation')}</span>
                </div>
                <div style={styles.floatingCard2}>
                  <Stethoscope size={24} color="#10b981" />
                  <span>{t('home.specialists')}</span>
                </div>
                <div style={styles.floatingCard3}>
                  <ClipboardList size={24} color="#f59e0b" />
                  <span>{t('home.medicalReports')}</span>
                </div>
                <div style={styles.heroCircle}></div>
              </div>
            </div>

            {/* Stats Section - IMPROVED */}
            <div style={styles.statsSection}>
              <div style={styles.statsContainer}>
                <div style={styles.statCard}>
                  <div style={styles.statIconBg}><MessageCircle size={24} /></div>
                  <div style={styles.statNumber}>{stats.totalConsultations}</div>
                  <div style={styles.statLabel}>{t('home.totalConsultations')}</div>
                  <div style={styles.statTrend}>↑ 12% {t('home.thisMonth')}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIconBg}><CheckCircle size={24} /></div>
                  <div style={styles.statNumber}>{stats.completedConsultations}</div>
                  <div style={styles.statLabel}>{t('home.completed')}</div>
                  <div style={styles.statTrend}>↑ 8% {t('home.thisMonth')}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIconBg}><Clock size={24} /></div>
                  <div style={styles.statNumber}>{stats.averageDuration}</div>
                  <div style={styles.statLabel}>{t('home.avgMinutes')}</div>
                  <div style={styles.statTrend}>↓ 5% {t('home.faster')}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIconBg}><Star size={24} /></div>
                  <div style={styles.statNumber}>4.8</div>
                  <div style={styles.statLabel}>{t('home.userRating')}</div>
                  <div style={styles.statTrend}>★★★★★</div>
                </div>
              </div>
            </div>

            {/* Features Section - IMPROVED */}
            <div style={styles.featuresSection}>
              <div style={styles.sectionHeader}>
                <h2>{t('home.whyChoose')} <span style={styles.sectionHeaderAccent}>{t('home.mediVoiceAI')}</span></h2>
                <p>{t('home.featureDesc')}</p>
              </div>
              <div style={styles.featuresGrid}>
                <div style={styles.featureCard}>
                  <div style={styles.featureIcon}><Mic size={32} /></div>
                  <h3>{t('home.featureVoice')}</h3>
                  <p>{t('home.featureVoiceDesc')}</p>
                  <div style={styles.featureTag}>{t('home.realTime')}</div>
                </div>
                <div style={styles.featureCard}>
                  <div style={styles.featureIcon}><Stethoscope size={32} /></div>
                  <h3>{t('home.featureSpecialists')}</h3>
                  <p>{t('home.featureSpecialistsDesc')}</p>
                  <div style={styles.featureTag}>{t('home.multiSpecialty')}</div>
                </div>
                <div style={styles.featureCard}>
                  <div style={styles.featureIcon}><ClipboardList size={32} /></div>
                  <h3>{t('home.featureReports')}</h3>
                  <p>{t('home.featureReportsDesc')}</p>
                  <div style={styles.featureTag}>{t('home.instantDownload')}</div>
                </div>
                <div style={styles.featureCard}>
                  <div style={styles.featureIcon}><Calendar size={32} /></div>
                  <h3>{t('home.featureAppointments')}</h3>
                  <p>{t('home.featureAppointmentsDesc')}</p>
                  <div style={styles.featureTag}>{t('home.easyBooking')}</div>
                </div>
                <div style={styles.featureCard}>
                  <div style={styles.featureIcon}><Mail size={32} /></div>
                  <h3>{t('home.featureEmail')}</h3>
                  <p>{t('home.featureEmailDesc')}</p>
                  <div style={styles.featureTag}>{t('home.shareWithDoctors')}</div>
                </div>
                <div style={styles.featureCard}>
                  <div style={styles.featureIcon}><Shield size={32} /></div>
                  <h3>{t('home.featureSecure')}</h3>
                  <p>{t('home.featureSecureDesc')}</p>
                  <div style={styles.featureTag}>{t('home.hipaaCompliant')}</div>
                </div>
              </div>
            </div>

            {/* How It Works Section */}
            <div style={styles.howItWorksSection}>
              <div style={styles.sectionHeader}>
                <h2>{t('home.howItWorks')} <span style={styles.sectionHeaderAccent}>{t('home.works')}</span></h2>
                <p>{t('home.clickToLearn')}</p>
              </div>
              <div style={styles.stepsContainer}>
                <div 
                  onClick={() => setSelectedStep(selectedStep === 1 ? null : 1)}
                  style={{
                    ...styles.stepCard,
                    ...(selectedStep === 1 ? styles.stepCardExpanded : {}),
                    cursor: 'pointer',
                  }}
                >
                  <div style={styles.stepNumber}>01</div>
                  <div style={styles.stepIcon}>🎤</div>
                  <h3 style={styles.stepTitle}>{t('home.step1Title')}</h3>
                  <p style={styles.stepDescription}>{t('home.step1Desc')}</p>
                  {selectedStep === 1 && (
                    <div style={styles.stepDetails}>
                      <div style={styles.stepDetailItem}>🎙️ {t('home.step1Detail1')}</div>
                      <div style={styles.stepDetailItem}>🌐 {t('home.step1Detail2')}</div>
                      <div style={styles.stepDetailItem}>⚡ {t('home.step1Detail3')}</div>
                      <div style={styles.stepDetailItem}>⌨️ {t('home.step1Detail4')}</div>
                    </div>
                  )}
                </div>
                <div style={styles.stepArrow}>→</div>
                <div 
                  onClick={() => setSelectedStep(selectedStep === 2 ? null : 2)}
                  style={{
                    ...styles.stepCard,
                    ...(selectedStep === 2 ? styles.stepCardExpanded : {}),
                    cursor: 'pointer',
                  }}
                >
                  <div style={styles.stepNumber}>02</div>
                  <div style={styles.stepIcon}>🤖</div>
                  <h3 style={styles.stepTitle}>{t('home.step2Title')}</h3>
                  <p style={styles.stepDescription}>{t('home.step2Desc')}</p>
                  {selectedStep === 2 && (
                    <div style={styles.stepDetails}>
                      <div style={styles.stepDetailItem}>🧠 {t('home.step2Detail1')}</div>
                      <div style={styles.stepDetailItem}>👨‍⚕️ {t('home.step2Detail2')}</div>
                      <div style={styles.stepDetailItem}>💭 {t('home.step2Detail3')}</div>
                      <div style={styles.stepDetailItem}>📝 {t('home.step2Detail4')}</div>
                    </div>
                  )}
                </div>
                <div style={styles.stepArrow}>→</div>
                <div 
                  onClick={() => setSelectedStep(selectedStep === 3 ? null : 3)}
                  style={{
                    ...styles.stepCard,
                    ...(selectedStep === 3 ? styles.stepCardExpanded : {}),
                    cursor: 'pointer',
                  }}
                >
                  <div style={styles.stepNumber}>03</div>
                  <div style={styles.stepIcon}>📋</div>
                  <h3 style={styles.stepTitle}>{t('home.step3Title')}</h3>
                  <p style={styles.stepDescription}>{t('home.step3Desc')}</p>
                  {selectedStep === 3 && (
                    <div style={styles.stepDetails}>
                      <div style={styles.stepDetailItem}>📄 {t('home.step3Detail1')}</div>
                      <div style={styles.stepDetailItem}>📧 {t('home.step3Detail2')}</div>
                      <div style={styles.stepDetailItem}>📅 {t('home.step3Detail3')}</div>
                      <div style={styles.stepDetailItem}>📊 {t('home.step3Detail4')}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Testimonials Section */}
            <div style={styles.testimonialsSection}>
              <div style={styles.sectionHeader}>
                <h2>{t('home.whatUsersSay')} <span style={styles.sectionHeaderAccent}>{t('home.aboutUs')}</span></h2>
                <p>{t('home.trustedBy')}</p>
              </div>
              <div style={styles.testimonialsGrid}>
                <div style={styles.testimonialCard}>
                  <div style={styles.testimonialStars}>★★★★★</div>
                  <p>{t('home.testimonial1')}</p>
                  <div style={styles.testimonialAuthor}>
                    <div style={styles.testimonialAvatar}>R</div>
                    <div>
                      <strong>Rajesh Kumar</strong>
                      <span>{t('home.verifiedUser')}</span>
                    </div>
                  </div>
                </div>
                <div style={styles.testimonialCard}>
                  <div style={styles.testimonialStars}>★★★★★</div>
                  <p>{t('home.testimonial2')}</p>
                  <div style={styles.testimonialAuthor}>
                    <div style={styles.testimonialAvatar}>P</div>
                    <div>
                      <strong>Priya Sharma</strong>
                      <span>{t('home.verifiedUser')}</span>
                    </div>
                  </div>
                </div>
                <div style={styles.testimonialCard}>
                  <div style={styles.testimonialStars}>★★★★★</div>
                  <p>{t('home.testimonial3')}</p>
                  <div style={styles.testimonialAuthor}>
                    <div style={styles.testimonialAvatar}>A</div>
                    <div>
                      <strong>Amit Patel</strong>
                      <span>{t('home.verifiedUser')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section - IMPROVED */}
            <div style={styles.ctaSection}>
              <div style={styles.ctaContent}>
                <h2>{t('home.readyTitle')}</h2>
                <p>{t('home.readyDesc')}</p>
                <button onClick={() => setCurrentPage('consultation')} style={styles.ctaButton}>
                  {t('home.startYourFreeConsultation')}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'dashboard' && (
          <div style={styles.pageContainer}>
            <EnhancedDashboard consultations={consultations} stats={stats} />
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowAnalytics(true)} 
                style={styles.analyticsButton}
              >
                <TrendingUp size={16} /> View Analytics Dashboard
              </button>
              <button 
                onClick={handleOpenClinicDashboard} 
                style={styles.clinicButton}
                disabled={isCreatingClinic}
              >
                <Building2 size={18} /> {isCreatingClinic ? 'Loading Clinic...' : '🏥 Clinic Dashboard'}
              </button>
            </div>
          </div>
        )}

        {currentPage === 'consultation' && (
          <div style={styles.consultationContainer}>
            <div style={styles.consultationHeader}>
              <div><h2 style={styles.consultationTitle}>{t('consultation.title')}</h2><p style={styles.consultationSubtitle}>{t('consultation.subtitle')}</p></div>
              <button onClick={() => setCurrentPage('home')} style={styles.closeButton}><X size={20} /></button>
            </div>
            {!consultationStarted ? (
              <div style={styles.setupSection}>
                <SpecialistSelector selectedSpecialist={selectedSpecialist} onSelect={setSelectedSpecialist} />
                <button onClick={startConsultation} disabled={!selectedSpecialist} style={styles.startConsultButton}>{t('consultation.startWith')} {selectedSpecialist || t('consultation.selectedSpecialist')}</button>
              </div>
            ) : (
              <div style={styles.activeConsultation}>
                <div style={styles.specialistInfo}>
                  <div style={styles.specialistBadge}>{getSpecialistIcon(selectedSpecialist)}<span>{selectedSpecialist} {t('consultation.specialist') || 'Specialist'}</span></div>
                  <button onClick={endConsultation} style={styles.endButton}>{t('consultation.endConsultation')}</button>
                </div>
                <VoiceRecorder 
                  consultationId={consultationId} 
                  specialistType={selectedSpecialist} 
                  onTranscriptUpdate={handleTranscriptUpdate} 
                  onAIResponse={handleAIResponse}
                  onTriageResult={setTriageResult}
                  userId={getCurrentUserId()}
                />
                
                <ChatMessages 
                  messages={messages}
                  onAddMessage={addMessage}
                  sessionId={getCurrentSessionId()}
                  userId={getCurrentUserId()}
                  triageResult={triageResult}
                  streamingMessage={streamingMessage}
                  isStreaming={isStreaming}
                />
              </div>
            )}
          </div>
        )}

        {currentPage === 'reports' && (
          <div style={styles.pageContainer}>
            <div style={styles.pageHeader}><h2 style={styles.pageTitle}>{t('reports.title')}</h2><p style={styles.pageSubtitle}>{t('reports.subtitle')}</p></div>
            <div style={styles.reportsList}>
              {consultations.filter(c => c.status === 'completed').map((consultation) => (
                <div key={consultation.id} style={styles.reportCard}>
                  <div style={styles.reportHeader}>
                    <div style={styles.reportIconArea}>{getSpecialistIcon(consultation.specialistType)}</div>
                    <div style={styles.reportInfo}>
                      <h3 style={styles.reportTitle}>{t('reports.consultationWith')} {consultation.specialistName}</h3>
                      <p style={styles.reportDate}>{new Date(consultation.startedAt).toLocaleDateString()}</p>
                    </div>
                    <div style={styles.reportStatus}>
                      <CheckCircle size={14} color="#10b981" />
                      <span>{t('reports.completed')}</span>
                    </div>
                  </div>
                  <div style={styles.reportContent}>
                    <p><strong>{t('reports.symptoms')}:</strong> {consultation.symptoms?.substring(0, 100)}...</p>
                    <p><strong>{t('reports.duration')}:</strong> {consultation.duration} {t('reports.minutes')}</p>
                  </div>
                  <div style={styles.reportActions}>
                    <button onClick={() => handleViewReport(consultation.id)} style={styles.downloadButton}>
                      <Download size={16} />
                      <span>{t('reports.viewReport')}</span>
                    </button>
                    <button onClick={() => handleBookAppointment(consultation)} style={styles.bookButton}>
                      <Calendar size={16} />
                      <span>{t('reports.bookFollowup')}</span>
                    </button>
                    <button onClick={() => handleRateConsultation(consultation)} style={styles.ratingButton}>
                      <Star size={16} />
                      <span>{t('reports.rateConsultation')}</span>
                    </button>
                    <button onClick={() => handleViewEnhancedReport(consultation)} style={styles.enhancedReportButton}>
                      <FileText size={16} />
                      <span>View SOAP Report</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Symptom Checker Modal */}
        {showEnhancedSymptomChecker && (
          <EnhancedSymptomChecker 
            onClose={() => setShowEnhancedSymptomChecker(false)}
            onStartConsultation={handleSymptomCheckerConsultation}
          />
        )}

        {/* Regular Symptom Checker Modal (for backward compatibility) */}
        {showSymptomChecker && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <button onClick={() => setShowSymptomChecker(false)} style={styles.modalClose}><X size={18} /></button>
              <SymptomChecker onClose={() => setShowSymptomChecker(false)} />
            </div>
          </div>
        )}

        {/* Medication Reminder Modal */}
        {showReminders && (
          <MedicationReminder 
            userId={getCurrentUserId()} 
            onClose={() => setShowReminders(false)} 
          />
        )}

        {/* Enhanced Report Modal */}
        {showEnhancedReport && selectedReportData && (
          <EnhancedReportViewer 
            consultationData={selectedReportData} 
            onClose={() => setShowEnhancedReport(false)} 
          />
        )}

        {/* Doctor Analytics Dashboard Modal */}
        {showAnalytics && (
          <DoctorAnalyticsDashboard 
            consultations={consultations}
            ratings={JSON.parse(localStorage.getItem('consultationRatings') || '{}')}
            onClose={() => setShowAnalytics(false)}
          />
        )}

        {/* Clinic Dashboard Modal */}
        {showClinicDashboard && currentClinicId && (
          <div style={styles.modalOverlayFull}>
            <div style={styles.modalFullContent}>
              <button onClick={() => setShowClinicDashboard(false)} style={styles.modalCloseBtn}>×</button>
              <ClinicDashboard clinicId={currentClinicId} />
            </div>
          </div>
        )}

        {showReportModal && selectedConsultation && <MedicalReportModal consultationId={selectedConsultation.id} specialistType={selectedConsultation.specialistType} symptoms={selectedConsultation.symptoms || 'No symptoms recorded'} onClose={() => setShowReportModal(false)} />}
        {showAppointmentModal && currentConsultationForAppointment && <AppointmentBooking consultationId={currentConsultationForAppointment.id} specialistType={currentConsultationForAppointment.specialistType} specialistName={currentConsultationForAppointment.specialistName} patientName={getUserName()} onClose={() => setShowAppointmentModal(false)} onBooked={(apt) => { console.log('Appointment booked:', apt); setShowAppointmentModal(false); alert(t('appointments.booked') || '✅ Appointment booked successfully!'); }} />}
        {showHealthTips && <HealthTips onClose={() => setShowHealthTips(false)} />}
        {showEmergencyContacts && <EmergencyContacts onClose={() => setShowEmergencyContacts(false)} />}
        {showRatingModal && selectedRatingConsultation && (
          <ConsultationRating
            consultationId={selectedRatingConsultation.id}
            consultationTitle={`${t('reports.consultationWith')} ${selectedRatingConsultation.specialistName}`}
            onClose={() => setShowRatingModal(false)}
            onSubmit={handleRatingSubmit}
          />
        )}
        {showHealthGoals && <HealthGoals onClose={() => setShowHealthGoals(false)} />}
        {showVoiceCustomization && <VoiceCustomization onClose={() => setShowVoiceCustomization(false)} />}
        {showProgressDashboard && <ProgressDashboard onClose={() => setShowProgressDashboard(false)} />}
        {showTwoFactorAuth && <TwoFactorAuth onClose={() => setShowTwoFactorAuth(false)} />}
        {showDataExport && <DataExport onClose={() => setShowDataExport(false)} />}
        {showVideoConsultation && selectedVideoConsultation && (
          <VideoConsultation
            consultationId={selectedVideoConsultation.id}
            specialistName={selectedVideoConsultation.specialistName}
            specialistType={selectedVideoConsultation.specialistType}
            onClose={() => setShowVideoConsultation(false)}
            onEndCall={() => {
              setShowVideoConsultation(false);
              alert(t('consultation.videoEnded') || 'Video consultation ended. A report will be generated.');
            }}
          />
        )}
        
        {showAppointmentsList && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <button onClick={() => setShowAppointmentsList(false)} style={styles.modalClose}><X size={18} /></button>
              <MyAppointments />
            </div>
          </div>
        )}

        {showPricing && <PricingPlans onClose={() => setShowPricing(false)} />}
        
        <Footer 
          setCurrentPage={handleFooterNavigation}
          setShowSymptomChecker={setShowEnhancedSymptomChecker}
          setShowHealthTips={setShowHealthTips}
          setShowEmergencyContacts={setShowEmergencyContacts}
          setShowHealthGoals={setShowHealthGoals}
          setShowAppointmentsList={setShowAppointmentsList}
        />
      </div>
    </AuthGuard>
  );
}

function App() {
  return (
    <AuthGuard>
      <AppContent />
    </AuthGuard>
  );
}

// ===== UPDATED STYLES =====
const styles = {
  app: { 
    minHeight: '100vh', 
    background: 'var(--bg-primary)',
  },
  pageNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '12px 24px',
    background: 'var(--bg-card)',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '20px',
  },
  pageNavButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#3b82f6',
    fontSize: '14px',
    fontWeight: 500,
  },
  pageNavTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  homeContainer: {
    overflowX: 'hidden' as const,
  },
  // ===== IMPROVED HERO SECTION =====
  heroSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '60px',
    padding: '60px 40px',
    background: 'var(--hero-bg)',
    alignItems: 'center',
    borderRadius: '20px',
    margin: '0 24px 40px',
    boxShadow: 'var(--card-shadow)',
  },
  heroContent: {
    maxWidth: '560px',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px 6px 12px',
    background: 'rgba(37, 99, 235, 0.1)',
    borderRadius: '9999px',
    color: '#2563eb',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '20px',
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: 800,
    color: 'var(--text-primary)',
    lineHeight: 1.15,
    marginBottom: '16px',
  },
  heroTitleAccent: {
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '18px',
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
    marginBottom: '32px',
  },
  heroButtons: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap' as const,
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: 'white',
    border: 'none',
    borderRadius: '9999px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
  },
  secondaryButton: {
    padding: '14px 32px',
    background: 'transparent',
    border: '2px solid var(--border-color)',
    borderRadius: '9999px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    transition: 'all 0.25s ease',
  },
  heroImage: {
    position: 'relative' as const,
    height: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingCard1: {
    position: 'absolute' as const,
    top: '20%',
    left: '10%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    background: 'var(--bg-card)',
    borderRadius: '16px',
    boxShadow: 'var(--card-shadow)',
    animation: 'float 3s ease-in-out infinite',
    border: '1px solid var(--border-color)',
  },
  floatingCard2: {
    position: 'absolute' as const,
    top: '50%',
    right: '10%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    background: 'var(--bg-card)',
    borderRadius: '16px',
    boxShadow: 'var(--card-shadow)',
    animation: 'float 4s ease-in-out infinite',
    border: '1px solid var(--border-color)',
  },
  floatingCard3: {
    position: 'absolute' as const,
    bottom: '20%',
    left: '20%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    background: 'var(--bg-card)',
    borderRadius: '16px',
    boxShadow: 'var(--card-shadow)',
    animation: 'float 3.5s ease-in-out infinite',
    border: '1px solid var(--border-color)',
  },
  heroCircle: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0) 70%)',
    borderRadius: '50%',
  },
  // ===== IMPROVED STATS SECTION =====
  statsSection: {
    padding: '40px 24px',
    background: 'transparent',
  },
  statsContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
  },
  statCard: {
    textAlign: 'center' as const,
    padding: '28px 20px',
    background: 'var(--bg-card)',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--card-shadow)',
    transition: 'all 0.3s ease',
  },
  statIconBg: {
    width: '56px',
    height: '56px',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    color: '#3b82f6',
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  statLabel: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginTop: '8px',
  },
  statTrend: {
    fontSize: '12px',
    color: '#10b981',
    marginTop: '8px',
  },
  // ===== IMPROVED FEATURES SECTION =====
  featuresSection: {
    padding: '60px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionHeader: {
    textAlign: 'center' as const,
    marginBottom: '48px',
  },
  sectionHeaderAccent: {
    color: '#3b82f6',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '32px',
  },
  featureCard: {
    padding: '32px',
    background: 'var(--bg-card)',
    borderRadius: '24px',
    border: '1px solid var(--border-color)',
    position: 'relative' as const,
    boxShadow: 'var(--card-shadow)',
    transition: 'all 0.3s ease',
  },
  featureIcon: {
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
    color: 'white',
  },
  featureTag: {
    position: 'absolute' as const,
    top: '20px',
    right: '20px',
    padding: '4px 12px',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '9999px',
    fontSize: '12px',
    color: '#3b82f6',
  },
  // ===== IMPROVED CTA SECTION =====
  ctaSection: {
    margin: '40px 24px 60px',
    padding: '60px',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    borderRadius: '20px',
    textAlign: 'center' as const,
    color: 'white',
    boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)',
  },
  ctaContent: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  ctaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 32px',
    background: 'white',
    color: '#2563eb',
    border: 'none',
    borderRadius: '9999px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
    marginTop: '24px',
    transition: 'all 0.25s ease',
  },
  // ===== EXISTING STYLES (unchanged) =====
  pageContainer: { 
    maxWidth: '1280px', 
    margin: '40px auto', 
    padding: '0 24px' 
  },
  pageHeader: { 
    marginBottom: '32px' 
  },
  pageTitle: { 
    fontSize: '28px', 
    fontWeight: 700, 
    color: 'var(--text-primary)', 
    marginBottom: '8px' 
  },
  pageSubtitle: { 
    fontSize: '14px', 
    color: 'var(--text-secondary)' 
  },
  analyticsButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
  },
  clinicButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  consultationContainer: { 
    maxWidth: '1200px', 
    margin: '40px auto', 
    padding: '32px', 
    background: 'var(--bg-card)', 
    borderRadius: '24px', 
    border: '1px solid var(--border-color)' 
  },
  consultationTitle: { 
    fontSize: '22px', 
    fontWeight: 600, 
    color: 'var(--text-primary)' 
  },
  consultationSubtitle: { 
    fontSize: '13px', 
    color: 'var(--text-secondary)', 
    marginTop: '4px' 
  },
  consultationHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: '24px', 
    paddingBottom: '20px', 
    borderBottom: '1px solid var(--border-color)' 
  },
  closeButton: { 
    background: 'transparent', 
    border: 'none', 
    cursor: 'pointer', 
    color: 'var(--text-secondary)', 
    padding: '8px', 
    borderRadius: '8px' 
  },
  setupSection: { 
    padding: '20px' 
  },
  startConsultButton: { 
    marginTop: '30px', 
    padding: '14px 28px', 
    fontSize: '16px', 
    background: 'var(--button-primary)', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontWeight: 500, 
    width: '100%' 
  },
  activeConsultation: { 
    padding: '20px' 
  },
  specialistInfo: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '24px', 
    padding: '14px 20px', 
    background: 'var(--badge-bg)',
    borderRadius: '12px' 
  },
  specialistBadge: { 
    display: 'flex', 
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--button-primary)'
  },
  endButton: {
    padding: '8px 20px',
    background: 'var(--button-danger)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '13px'
  },
  reportsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '24px'
  },
  reportCard: {
    background: 'var(--bg-card)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid var(--border-color)'
  },
  reportHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--border-color)'
  },
  reportIconArea: {
    width: '40px',
    height: '40px',
    background: 'var(--badge-bg)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--button-primary)',
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: '15px',
    fontWeight: 600,
    margin: 0,
    color: 'var(--text-primary)',
  },
  reportDate: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    margin: '4px 0 0',
  },
  reportStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: 'var(--status-completed-text)',
    background: 'var(--status-completed-bg)',
    padding: '4px 10px',
    borderRadius: '20px',
  },
  reportContent: {
    marginBottom: '16px',
    color: 'var(--text-secondary)',
  },
  reportActions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  downloadButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px',
    background: 'var(--badge-bg)',
    color: 'var(--text-secondary)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '13px',
  },
  bookButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px',
    background: 'var(--badge-bg)',
    color: 'var(--button-primary)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '13px',
  },
  ratingButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '13px',
  },
  enhancedReportButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px',
    background: '#8b5cf6',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '13px',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalOverlayFull: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: 'var(--bg-card)',
    borderRadius: '20px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '85vh',
    overflow: 'auto' as const,
    position: 'relative' as const,
    padding: '24px',
  },
  modalFullContent: {
    background: 'var(--bg-primary)',
    borderRadius: '20px',
    width: '95%',
    maxWidth: '1400px',
    height: '90vh',
    overflow: 'auto' as const,
    position: 'relative' as const,
  },
  modalCloseBtn: {
    position: 'absolute' as const,
    top: '16px',
    right: '16px',
    background: 'rgba(0,0,0,0.5)',
    border: 'none',
    cursor: 'pointer',
    color: 'white',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
    fontSize: '20px',
  },
  modalClose: {
    position: 'absolute' as const,
    top: '16px',
    right: '16px',
    background: 'var(--badge-bg)',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ===== KEEP EXISTING HOW IT WORKS & TESTIMONIALS STYLES =====
  howItWorksSection: {
    padding: '60px 24px',
    background: 'var(--bg-secondary)',
  },
  stepsContainer: {
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
  },
  stepCard: {
    flex: 1,
    textAlign: 'center' as const,
    padding: '32px 24px',
    background: 'var(--bg-card)',
    borderRadius: '24px',
    position: 'relative' as const,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    boxShadow: 'var(--card-shadow)',
  },
  stepCardExpanded: {
    transform: 'scale(1.02)',
    boxShadow: '0 0 0 3px #3b82f6, 0 20px 40px -10px rgba(0,0,0,0.25)',
    borderColor: '#3b82f6',
  },
  stepNumber: {
    position: 'absolute' as const,
    top: '-12px',
    left: '20px',
    fontSize: '48px',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    opacity: 0.3,
  },
  stepIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  stepTitle: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '8px',
    color: 'var(--text-primary)',
  },
  stepDescription: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
  },
  stepArrow: {
    fontSize: '32px',
    color: '#3b82f6',
    opacity: 0.7,
  },
  stepDetails: {
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color)',
    animation: 'fadeInUp 0.3s ease-out',
    background: 'var(--badge-bg)',
    borderRadius: '12px',
    padding: '16px',
  },
  stepDetailItem: {
    padding: '8px 0',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px dashed var(--border-light)',
  },
  testimonialsSection: {
    padding: '60px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  testimonialsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '32px',
  },
  testimonialCard: {
    padding: '28px',
    background: 'var(--bg-card)',
    borderRadius: '24px',
    border: '1px solid var(--border-color)',
  },
  testimonialStars: {
    fontSize: '20px',
    color: '#f59e0b',
    marginBottom: '16px',
  },
  testimonialAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '20px',
  },
  testimonialAvatar: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 600,
    color: 'white',
  },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(styleSheet);

export default App;