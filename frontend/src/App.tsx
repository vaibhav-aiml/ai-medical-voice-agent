import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { 
  Home, LayoutDashboard, FileText, Calendar, Plus, Mic, Stethoscope,
  ClipboardList, ArrowRight, Download, X, Activity, Brain, Heart, Bone, Baby,
  Sparkles, MessageCircle, Clock, CheckCircle, Star, Mail, Shield
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
import { useLanguage } from './context/LanguageContext';
import { useSubscription } from './context/SubscriptionContext';
import { Message, ConsultationSession, DashboardStats } from './types/consultation.types';
import HIPAACompliance from './pages/HIPAACompliance';
import CookiePolicy from './pages/CookiePolicy';

function AppContent() {
  const { userId } = useAuth();
  const { user } = useUser();
  const { t } = useLanguage();
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

  // Get current session ID
  const getCurrentSessionId = () => {
    return consultationId || `session_${Date.now()}`;
  };

  // Get current user ID from Clerk
  const getCurrentUserId = () => {
    return userId || user?.id || `user_${Date.now()}`;
  };

  useEffect(() => {
    if (userId) {
      setLoading(true);
      try {
        const savedConsultations = localStorage.getItem(`consultations_${userId}`);
        if (savedConsultations) {
          const parsed = JSON.parse(savedConsultations);
          setConsultations(parsed);
          updateStats(parsed);
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
          localStorage.setItem(`consultations_${userId}`, JSON.stringify(mockConsultations));
          updateStats(mockConsultations);
        }
      } catch (error) {
        console.error('Error loading consultations:', error);
        setConsultations([]);
        updateStats([]);
      } finally {
        setLoading(false);
      }
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
      alert('Please select a specialist first');
      return;
    }

    if (!canStartConsultation()) {
      const remaining = getRemainingConsultations();
      if (remaining === 0 && subscription.tier === 'free') {
        alert('You have used all 5 free consultations this month. Please upgrade to Pro or Family plan to continue.');
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

  // Updated handleAIResponse for streaming
  const handleAIResponse = (response: string, isComplete?: boolean) => {
    if (isComplete) {
      // This is the complete response - add to chat
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
      // This is a streaming chunk - update preview only
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
    
    const newConsultation: ConsultationSession = {
      id: consultationId,
      specialistType: selectedSpecialist,
      specialistName: specialistName,
      status: 'completed',
      symptoms: symptoms,
      notes: 'Consultation completed. Medical report generated.',
      duration: Math.floor(Math.random() * 20) + 10,
      startedAt: new Date(),
      endedAt: new Date(),
    };
    
    const existing = localStorage.getItem(`consultations_${userId}`);
    const existingConsultations = existing ? JSON.parse(existing) : [];
    const updatedConsultations = [newConsultation, ...existingConsultations];
    localStorage.setItem(`consultations_${userId}`, JSON.stringify(updatedConsultations));
    
    setConsultations(updatedConsultations);
    updateStats(updatedConsultations);
    
    setConsultationStarted(false);
    setSelectedSpecialist('');
    setCurrentPage('dashboard');
    setMessages([]);
    setManualSymptoms('');
    setTriageResult(null);
    setStreamingMessage('');
    setIsStreaming(false);
    setRefreshKey(prev => prev + 1);
    
    alert('✅ Consultation ended! Your report has been saved.');
  };

  const handleViewReport = (consultationId: string) => {
    const consultation = consultations.find(c => c.id === consultationId);
    if (consultation) {
      setSelectedConsultation(consultation);
      setShowReportModal(true);
    }
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
    <div style={{...styles.app, paddingTop: '0px' }}>
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setShowSymptomChecker={setShowSymptomChecker}
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
        userName={getUserName()}
      />

      {currentPage !== 'home' && (
        <div style={styles.pageNav}>
          <button onClick={() => setCurrentPage('home')} style={styles.pageNavButton}>
            ← Back to Home
          </button>
          <span style={styles.pageNavTitle}>
            {currentPage === 'dashboard' && 'Dashboard'}
            {currentPage === 'consultation' && 'AI Medical Consultation'}
            {currentPage === 'reports' && 'Medical Reports'}
          </span>
        </div>
      )}

      {currentPage === 'home' && (
        <div style={styles.homeContainer}>
          <div style={styles.heroSection}>
            <div style={styles.heroContent}>
              <div style={styles.heroBadge}>
                <Sparkles size={16} />
                <span>AI-Powered Healthcare</span>
              </div>
              <h1 style={styles.heroTitle}>
                Your Health,<br />
                <span style={styles.heroTitleAccent}>Our Priority</span>
              </h1>
              <p style={styles.heroSubtitle}>
                Experience the future of healthcare with AI-powered consultations. 
                Get instant medical advice from specialized doctors, anytime, anywhere.
              </p>
              <div style={styles.heroButtons}>
                <button onClick={() => setCurrentPage('consultation')} style={styles.primaryButton}>
                  Start Consultation
                  <ArrowRight size={18} />
                </button>
                <button onClick={() => setShowSymptomChecker(true)} style={styles.secondaryButton}>
                  Check Symptoms
                </button>
              </div>
            </div>
            <div style={styles.heroImage}>
              <div style={styles.floatingCard1}>
                <Mic size={24} color="#3b82f6" />
                <span>Voice Consultation</span>
              </div>
              <div style={styles.floatingCard2}>
                <Stethoscope size={24} color="#10b981" />
                <span>AI Specialists</span>
              </div>
              <div style={styles.floatingCard3}>
                <ClipboardList size={24} color="#f59e0b" />
                <span>Medical Reports</span>
              </div>
              <div style={styles.heroCircle}></div>
            </div>
          </div>

          <div style={styles.statsSection}>
            <div style={styles.statsContainer}>
              <div style={styles.statCard}>
                <div style={styles.statIconBg}><MessageCircle size={24} /></div>
                <div style={styles.statNumber}>{stats.totalConsultations}</div>
                <div style={styles.statLabel}>Total Consultations</div>
                <div style={styles.statTrend}>↑ 12% this month</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIconBg}><CheckCircle size={24} /></div>
                <div style={styles.statNumber}>{stats.completedConsultations}</div>
                <div style={styles.statLabel}>Completed</div>
                <div style={styles.statTrend}>↑ 8% this month</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIconBg}><Clock size={24} /></div>
                <div style={styles.statNumber}>{stats.averageDuration}</div>
                <div style={styles.statLabel}>Avg Minutes</div>
                <div style={styles.statTrend}>↓ 5% faster</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIconBg}><Star size={24} /></div>
                <div style={styles.statNumber}>4.8</div>
                <div style={styles.statLabel}>User Rating</div>
                <div style={styles.statTrend}>★★★★★</div>
              </div>
            </div>
          </div>

          <div style={styles.featuresSection}>
            <div style={styles.sectionHeader}>
              <h2>Why Choose <span style={styles.sectionHeaderAccent}>MediVoice AI?</span></h2>
              <p>Experience healthcare reimagined with cutting-edge AI technology</p>
            </div>
            <div style={styles.featuresGrid}>
              <div style={styles.featureCard}>
                <div style={styles.featureIcon}><Mic size={32} /></div>
                <h3>Voice Consultation</h3>
                <p>Speak naturally and get real-time AI responses without typing</p>
                <div style={styles.featureTag}>Real-time</div>
              </div>
              <div style={styles.featureCard}>
                <div style={styles.featureIcon}><Stethoscope size={32} /></div>
                <h3>5+ Specialists</h3>
                <p>General, Orthopedic, Cardiologist, Neurologist & Pediatrician</p>
                <div style={styles.featureTag}>Multi-specialty</div>
              </div>
              <div style={styles.featureCard}>
                <div style={styles.featureIcon}><ClipboardList size={32} /></div>
                <h3>Medical Reports</h3>
                <p>Download detailed PDF reports instantly after consultation</p>
                <div style={styles.featureTag}>Instant Download</div>
              </div>
              <div style={styles.featureCard}>
                <div style={styles.featureIcon}><Calendar size={32} /></div>
                <h3>Appointment Booking</h3>
                <p>Schedule follow-up appointments with your preferred specialist</p>
                <div style={styles.featureTag}>Easy Booking</div>
              </div>
              <div style={styles.featureCard}>
                <div style={styles.featureIcon}><Mail size={32} /></div>
                <h3>Email Reports</h3>
                <p>Receive medical reports directly in your inbox</p>
                <div style={styles.featureTag}>Share with Doctors</div>
              </div>
              <div style={styles.featureCard}>
                <div style={styles.featureIcon}><Shield size={32} /></div>
                <h3>Secure & Private</h3>
                <p>Your medical data is encrypted and securely stored</p>
                <div style={styles.featureTag}>HIPAA Compliant</div>
              </div>
            </div>
          </div>

          <div style={styles.howItWorksSection}>
            <div style={styles.sectionHeader}>
              <h2>How It <span style={styles.sectionHeaderAccent}>Works</span></h2>
              <p>Click on any step to learn more</p>
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
                <h3 style={styles.stepTitle}>Speak Your Symptoms</h3>
                <p style={styles.stepDescription}>Simply speak or type your symptoms naturally</p>
                {selectedStep === 1 && (
                  <div style={styles.stepDetails}>
                    <div style={styles.stepDetailItem}>🎙️ No typing needed - just speak naturally</div>
                    <div style={styles.stepDetailItem}>🌐 Works in multiple languages</div>
                    <div style={styles.stepDetailItem}>⚡ Real-time transcription</div>
                    <div style={styles.stepDetailItem}>⌨️ Text input also available</div>
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
                <h3 style={styles.stepTitle}>AI Doctor Analysis</h3>
                <p style={styles.stepDescription}>Our AI analyzes your symptoms and provides advice</p>
                {selectedStep === 2 && (
                  <div style={styles.stepDetails}>
                    <div style={styles.stepDetailItem}>🧠 Powered by advanced AI (Groq/OpenAI)</div>
                    <div style={styles.stepDetailItem}>👨‍⚕️ 5+ medical specialists available</div>
                    <div style={styles.stepDetailItem}>💭 Remembers conversation history</div>
                    <div style={styles.stepDetailItem}>📝 Provides personalized recommendations</div>
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
                <h3 style={styles.stepTitle}>Get Report & Follow-up</h3>
                <p style={styles.stepDescription}>Download report and schedule follow-up if needed</p>
                {selectedStep === 3 && (
                  <div style={styles.stepDetails}>
                    <div style={styles.stepDetailItem}>📄 Download detailed PDF reports</div>
                    <div style={styles.stepDetailItem}>📧 Email reports to yourself or doctor</div>
                    <div style={styles.stepDetailItem}>📅 Book follow-up appointments</div>
                    <div style={styles.stepDetailItem}>📊 Track consultation history</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={styles.testimonialsSection}>
            <div style={styles.sectionHeader}>
              <h2>What Our <span style={styles.sectionHeaderAccent}>Users Say</span></h2>
              <p>Trusted by thousands of patients worldwide</p>
            </div>
            <div style={styles.testimonialsGrid}>
              <div style={styles.testimonialCard}>
                <div style={styles.testimonialStars}>★★★★★</div>
                <p>"Amazing experience! The AI doctor understood my symptoms perfectly and gave helpful advice."</p>
                <div style={styles.testimonialAuthor}>
                  <div style={styles.testimonialAvatar}>R</div>
                  <div>
                    <strong>Rajesh Kumar</strong>
                    <span>Verified User</span>
                  </div>
                </div>
              </div>
              <div style={styles.testimonialCard}>
                <div style={styles.testimonialStars}>★★★★★</div>
                <p>"Saved me a trip to the clinic. Quick, accurate, and the report was very detailed."</p>
                <div style={styles.testimonialAuthor}>
                  <div style={styles.testimonialAvatar}>P</div>
                  <div>
                    <strong>Priya Sharma</strong>
                    <span>Verified User</span>
                  </div>
                </div>
              </div>
              <div style={styles.testimonialCard}>
                <div style={styles.testimonialStars}>★★★★★</div>
                <p>"The voice consultation feature is fantastic! So easy to use and the AI is very responsive."</p>
                <div style={styles.testimonialAuthor}>
                  <div style={styles.testimonialAvatar}>A</div>
                  <div>
                    <strong>Amit Patel</strong>
                    <span>Verified User</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.ctaSection}>
            <div style={styles.ctaContent}>
              <h2>Ready to Experience the Future of Healthcare?</h2>
              <p>Join thousands of satisfied users who trust MediVoice AI for their healthcare needs</p>
              <button onClick={() => setCurrentPage('consultation')} style={styles.ctaButton}>
                Start Your Free Consultation
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {currentPage === 'dashboard' && (
        <div style={styles.pageContainer}>
          <EnhancedDashboard consultations={consultations} stats={stats} />
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
                    <h3 style={styles.reportTitle}>Consultation with {consultation.specialistName}</h3>
                    <p style={styles.reportDate}>{new Date(consultation.startedAt).toLocaleDateString()}</p>
                  </div>
                  <div style={styles.reportStatus}>
                    <CheckCircle size={14} color="#10b981" />
                    <span>Completed</span>
                  </div>
                </div>
                <div style={styles.reportContent}>
                  <p><strong>Symptoms:</strong> {consultation.symptoms?.substring(0, 100)}...</p>
                  <p><strong>Duration:</strong> {consultation.duration} minutes</p>
                </div>
                <div style={styles.reportActions}>
                  <button onClick={() => handleViewReport(consultation.id)} style={styles.downloadButton}>
                    <Download size={16} />
                    <span>View Report</span>
                  </button>
                  <button onClick={() => handleBookAppointment(consultation)} style={styles.bookButton}>
                    <Calendar size={16} />
                    <span>Book Follow-up</span>
                  </button>
                  <button onClick={() => handleRateConsultation(consultation)} style={styles.ratingButton}>
                    <Star size={16} />
                    <span>Rate Consultation</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showReportModal && selectedConsultation && <MedicalReportModal consultationId={selectedConsultation.id} specialistType={selectedConsultation.specialistType} symptoms={selectedConsultation.symptoms || 'No symptoms recorded'} onClose={() => setShowReportModal(false)} />}
      {showAppointmentModal && currentConsultationForAppointment && <AppointmentBooking consultationId={currentConsultationForAppointment.id} specialistType={currentConsultationForAppointment.specialistType} specialistName={currentConsultationForAppointment.specialistName} patientName={getUserName()} onClose={() => setShowAppointmentModal(false)} onBooked={(apt) => { console.log('Appointment booked:', apt); setShowAppointmentModal(false); alert('✅ Appointment booked successfully!'); }} />}
      {showSymptomChecker && <SymptomChecker onClose={() => setShowSymptomChecker(false)} onStartConsultation={handleSymptomCheckerConsultation} />}
      {showHealthTips && <HealthTips onClose={() => setShowHealthTips(false)} />}
      {showEmergencyContacts && <EmergencyContacts onClose={() => setShowEmergencyContacts(false)} />}
      {showRatingModal && selectedRatingConsultation && (
        <ConsultationRating
          consultationId={selectedRatingConsultation.id}
          consultationTitle={`Consultation with ${selectedRatingConsultation.specialistName}`}
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
            alert('Video consultation ended. A report will be generated.');
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
        setShowSymptomChecker={setShowSymptomChecker}
        setShowHealthTips={setShowHealthTips}
        setShowEmergencyContacts={setShowEmergencyContacts}
        setShowHealthGoals={setShowHealthGoals}
        setShowAppointmentsList={setShowAppointmentsList}
      />
    </div>
  );
}

function App() {
  return (
    <AuthGuard>
      <AppContent />
    </AuthGuard>
  );
}

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
  heroSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '48px',
    padding: '60px 24px',
    background: 'linear-gradient(135deg, var(--bg-primary), var(--bg-secondary))',
    alignItems: 'center',
  },
  heroContent: {
    maxWidth: '600px',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '50px',
    color: '#3b82f6',
    fontSize: '14px',
    marginBottom: '24px',
  },
  heroTitle: {
    fontSize: '56px',
    fontWeight: 800,
    color: 'var(--text-primary)',
    lineHeight: 1.2,
    marginBottom: '20px',
  },
  heroTitleAccent: {
    color: '#3b82f6',
  },
  heroSubtitle: {
    fontSize: '18px',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    marginBottom: '32px',
  },
  heroButtons: {
    display: 'flex',
    gap: '16px',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
  },
  secondaryButton: {
    padding: '14px 28px',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  heroImage: {
    position: 'relative' as const,
    height: '400px',
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
    background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0) 70%)',
    borderRadius: '50%',
  },
  statsSection: {
    padding: '40px 24px',
    background: 'var(--bg-card)',
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
    padding: '24px',
    background: 'var(--bg-secondary)',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
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
    borderRadius: '20px',
    fontSize: '12px',
    color: '#3b82f6',
  },
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
  ctaSection: {
    margin: '40px 24px 60px',
    padding: '60px',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    borderRadius: '32px',
    textAlign: 'center' as const,
    color: 'white',
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
    color: '#3b82f6',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
    marginTop: '24px',
  },
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