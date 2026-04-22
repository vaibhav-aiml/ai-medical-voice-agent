import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { 
  Home, LayoutDashboard, FileText, Calendar, Plus, Mic, Stethoscope,
  ClipboardList, ArrowRight, Download, X, Activity, Brain, Heart, Bone, Baby,
  Sparkles, MessageCircle, Clock, CheckCircle, Star
} from 'lucide-react';
import AuthGuard from './components/AuthGuard';
import ThemeToggle from './components/ThemeToggle';
import LanguageSelector from './components/LanguageSelector';
import SymptomChecker from './components/SymptomChecker';
import HealthTips from './components/HealthTips';
import EmergencyContacts from './components/EmergencyContacts';
import ConsultationRating from './components/ConsultationRating';
import HealthGoals from './components/HealthGoals';
import VoiceCustomization from './components/VoiceCustomization';
import ProgressDashboard from './components/ProgressDashboard';
import TwoFactorAuth from './components/TwoFactorAuth';
import DataExport from './components/DataExport';
import SpecialistSelector from './components/SpecialistSelector';
import VoiceRecorder from './components/VoiceRecorder';
import ChatMessages from './components/ChatMessages';
import ConsultationHistory from './components/ConsultationHistory';
import DashboardStatsComponent from './components/DashboardStats';
import MedicalReportModal from './components/MedicalReportModal';
import AppointmentBooking from './components/AppointmentBooking';
import MyAppointments from './components/MyAppointments';
import { useLanguage } from './context/LanguageContext';
import { Message, ConsultationSession, DashboardStats } from './types/consultation.types';

function AppContent() {
  const { userId } = useAuth();
  const { user } = useUser();
  const { t } = useLanguage();
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
  const [selectedRatingConsultation, setSelectedRatingConsultation] = useState<ConsultationSession | null>(null);
  const [currentConsultationForAppointment, setCurrentConsultationForAppointment] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [manualSymptoms, setManualSymptoms] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalConsultations: 0,
    completedConsultations: 0,
    averageDuration: 0,
    pendingFollowUps: 0,
  });

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
    const newId = `consult_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setConsultationId(newId);
    setConsultationStarted(true);
    setMessages([]);
    setManualSymptoms('');
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

  const handleAIResponse = (response: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: response,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
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
  };

  const handleSymptomCheckerConsultation = (specialistType: string, symptoms: string) => {
    setSelectedSpecialist(specialistType);
    setManualSymptoms(symptoms);
    setCurrentPage('consultation');
    setConsultationStarted(true);
    setMessages([]);
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
      const avgRating = allRatings.length > 0 
        ? (allRatings.reduce((acc: number, r: any) => acc + r.rating, 0) / allRatings.length).toFixed(1)
        : 0;
      localStorage.setItem('averageRating', avgRating.toString());
    }
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

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <div onClick={() => setCurrentPage('home')} style={styles.logoContainer}>
            <div style={styles.logoIcon}><Sparkles size={22} /></div>
            <h1 style={styles.logo}>MediVoice AI</h1>
          </div>
          <div style={styles.navLinks}>
            <button onClick={() => setCurrentPage('home')} style={styles.navButton}><Home size={18} /><span>{t('nav.home')}</span></button>
            <button onClick={() => { setCurrentPage('dashboard'); setRefreshKey(prev => prev + 1); }} style={styles.navButton}><LayoutDashboard size={18} /><span>{t('nav.dashboard')}</span></button>
            <button onClick={() => setCurrentPage('reports')} style={styles.navButton}><FileText size={18} /><span>{t('nav.reports')}</span></button>
            <button onClick={() => setShowAppointmentsList(true)} style={styles.navButton}><Calendar size={18} /><span>{t('nav.appointments')}</span></button>
            <button onClick={() => setShowSymptomChecker(true)} style={styles.symptomButton}>
              🤖 {t('nav.symptomChecker')}
            </button>
            <button onClick={() => setShowHealthTips(true)} style={styles.healthButton}>
              📚 {t('nav.healthTips')}
            </button>
            <button onClick={() => setShowEmergencyContacts(true)} style={styles.emergencyButton}>
              🚨 {t('nav.emergency')}
            </button>
            <button onClick={() => setShowHealthGoals(true)} style={styles.goalsButton}>
              🎯 {t('nav.healthGoals')}
            </button>
            <button onClick={() => setShowVoiceCustomization(true)} style={styles.voiceButton}>
              🎤 {t('nav.voiceSettings')}
            </button>
            <button onClick={() => setShowProgressDashboard(true)} style={styles.progressButton}>
              📈 {t('nav.progress')}
            </button>
            <button onClick={() => setShowTwoFactorAuth(true)} style={styles.twoFactorButton}>
              🔒 {t('nav.twoFactor')}
            </button>
            <button onClick={() => setShowDataExport(true)} style={styles.exportDataButton}>
              📥 Export Data
            </button>
            <button onClick={() => { setCurrentPage('consultation'); setConsultationStarted(false); setMessages([]); setManualSymptoms(''); }} style={styles.consultButton}><Plus size={18} /><span>{t('nav.newConsultation')}</span></button>
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {currentPage === 'home' && (
        <div style={styles.hero}>
          <div style={styles.heroContent}>
            <div style={styles.badge}><Sparkles size={14} /><span>{t('home.aiPowered')}</span></div>
            <h1 style={styles.title}>{t('home.welcome')}, <span style={styles.titleAccent}>{getUserName()}</span></h1>
            <p style={styles.subtitle}>{t('home.subtitle')}</p>
            
            <div style={styles.statsRow}>
              <div style={styles.statItem}><div style={styles.statIcon}><MessageCircle size={20} /></div><div><div style={styles.statValue}>{stats.totalConsultations}</div><div style={styles.statLabel}>{t('home.consultations')}</div></div></div>
              <div style={styles.statDivider}></div>
              <div style={styles.statItem}><div style={styles.statIcon}><CheckCircle size={20} /></div><div><div style={styles.statValue}>{stats.completedConsultations}</div><div style={styles.statLabel}>{t('home.completed')}</div></div></div>
              <div style={styles.statDivider}></div>
              <div style={styles.statItem}><div style={styles.statIcon}><Clock size={20} /></div><div><div style={styles.statValue}>{stats.averageDuration}</div><div style={styles.statLabel}>{t('home.avgMinutes')}</div></div></div>
            </div>

            <div style={styles.features}>
              <div style={styles.card}><div style={styles.cardIcon}><Mic size={28} /></div><h3>{t('home.voiceConsultation')}</h3><p>{t('home.voiceDesc')}</p></div>
              <div style={styles.card}><div style={styles.cardIcon}><Stethoscope size={28} /></div><h3>{t('home.specialists')}</h3><p>{t('home.specialistsDesc')}</p></div>
              <div style={styles.card}><div style={styles.cardIcon}><ClipboardList size={28} /></div><h3>{t('home.medicalReports')}</h3><p>{t('home.medicalReportsDesc')}</p></div>
            </div>

            <button onClick={() => { setCurrentPage('consultation'); }} style={styles.startButton}>{t('home.startConsultation')} <ArrowRight size={18} /></button>
          </div>
        </div>
      )}

      {currentPage === 'dashboard' && (
        <div style={styles.pageContainer}>
          <div style={styles.pageHeader}><h2 style={styles.pageTitle}>{t('dashboard.title')}</h2><p style={styles.pageSubtitle}>{t('dashboard.subtitle')}</p></div>
          <DashboardStatsComponent stats={stats} />
          <ConsultationHistory consultations={consultations} onViewReport={handleViewReport} onNewConsultation={handleNewConsultation} />
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
              <VoiceRecorder consultationId={consultationId} specialistType={selectedSpecialist} onTranscriptUpdate={handleTranscriptUpdate} onAIResponse={handleAIResponse} />
              <ChatMessages messages={messages} />
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
                    <h3 style={styles.reportTitle}>{t('consultation.title')} with {consultation.specialistName}</h3>
                    <p style={styles.reportDate}>{new Date(consultation.startedAt).toLocaleDateString()}</p>
                  </div>
                  <div style={styles.reportStatus}>
                    <CheckCircle size={14} color="#10b981" />
                    <span>{t('reports.completed')}</span>
                  </div>
                </div>
                <div style={styles.reportContent}>
                  <p><strong>{t('reports.symptoms')}:</strong> {consultation.symptoms?.substring(0, 100)}...</p>
                  <p><strong>{t('reports.duration')}:</strong> {consultation.duration} {t('home.avgMinutes')}</p>
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showReportModal && selectedConsultation && <MedicalReportModal consultationId={selectedConsultation.id} specialistType={selectedConsultation.specialistType} symptoms={selectedConsultation.symptoms || 'No symptoms recorded'} onClose={() => setShowReportModal(false)} />}
      {showAppointmentModal && currentConsultationForAppointment && <AppointmentBooking consultationId={currentConsultationForAppointment.id} specialistType={currentConsultationForAppointment.specialistType} specialistName={currentConsultationForAppointment.specialistName} onClose={() => setShowAppointmentModal(false)} onBooked={(apt) => { console.log('Appointment booked:', apt); setShowAppointmentModal(false); alert('✅ Appointment booked successfully!'); }} />}
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
      
      {showAppointmentsList && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button onClick={() => setShowAppointmentsList(false)} style={styles.modalClose}><X size={18} /></button>
            <MyAppointments />
          </div>
        </div>
      )}
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
  loadingContainer: { 
    display: 'flex', 
    flexDirection: 'column' as const, 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh', 
    background: 'var(--bg-primary)',
  },
  loader: { 
    width: '50px', 
    height: '50px', 
    border: '3px solid var(--border-color)', 
    borderTop: '3px solid var(--button-primary)', 
    borderRadius: '50%', 
    animation: 'spin 1s linear infinite' 
  },
  nav: { 
    background: 'var(--nav-bg)', 
    padding: '1rem 0', 
    boxShadow: 'var(--card-shadow)', 
    position: 'sticky' as const, 
    top: 0, 
    zIndex: 100, 
    borderBottom: '1px solid var(--border-color)' 
  },
  navContent: { 
    maxWidth: '1280px', 
    margin: '0 auto', 
    padding: '0 24px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    flexWrap: 'wrap' as const, 
    gap: '16px' 
  },
  logoContainer: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    cursor: 'pointer' 
  },
  logoIcon: { 
    width: '36px', 
    height: '36px', 
    background: 'linear-gradient(135deg, var(--button-primary), #2563eb)', 
    borderRadius: '10px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    color: 'white' 
  },
  logo: { 
    fontSize: '1.25rem', 
    fontWeight: 700, 
    color: 'var(--text-primary)', 
    margin: 0 
  },
  navLinks: { 
    display: 'flex', 
    gap: '6px', 
    flexWrap: 'wrap' as const, 
    alignItems: 'center' 
  },
  navButton: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '8px 16px', 
    background: 'transparent', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    color: 'var(--text-secondary)', 
    fontSize: '0.875rem', 
    fontWeight: 500 
  },
  consultButton: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '8px 20px', 
    background: 'var(--button-primary)', 
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontSize: '0.875rem', 
    fontWeight: 500 
  },
  symptomButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  healthButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  emergencyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  goalsButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  voiceButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  progressButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  twoFactorButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  exportDataButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  hero: { 
    minHeight: 'calc(100vh - 72px)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: '48px 24px' 
  },
  heroContent: { 
    maxWidth: '1200px', 
    textAlign: 'center' as const 
  },
  badge: { 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '8px', 
    background: 'var(--badge-bg)', 
    padding: '6px 16px', 
    borderRadius: '50px', 
    color: 'var(--badge-text)', 
    fontSize: '0.75rem', 
    fontWeight: 500, 
    marginBottom: '24px' 
  },
  title: { 
    fontSize: '48px', 
    fontWeight: 700, 
    color: 'var(--text-primary)', 
    marginBottom: '16px', 
    letterSpacing: '-0.02em' 
  },
  titleAccent: { 
    color: 'var(--button-primary)' 
  },
  subtitle: { 
    fontSize: '18px', 
    color: 'var(--text-secondary)', 
    marginBottom: '48px', 
    maxWidth: '600px', 
    marginLeft: 'auto', 
    marginRight: 'auto', 
    lineHeight: 1.6 
  },
  statsRow: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '32px', 
    marginBottom: '64px', 
    background: 'var(--bg-card)', 
    padding: '24px 48px', 
    borderRadius: '60px', 
    maxWidth: '500px', 
    marginLeft: 'auto', 
    marginRight: 'auto' 
  },
  statItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px' 
  },
  statIcon: { 
    width: '40px', 
    height: '40px', 
    background: 'var(--badge-bg)', 
    borderRadius: '50%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    color: 'var(--button-primary)' 
  },
  statValue: { 
    fontSize: '20px', 
    fontWeight: 700, 
    color: 'var(--text-primary)' 
  },
  statLabel: { 
    fontSize: '12px', 
    color: 'var(--text-secondary)' 
  },
  statDivider: { 
    width: '1px', 
    height: '30px', 
    background: 'var(--border-color)' 
  },
  features: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
    gap: '24px', 
    marginBottom: '48px' 
  },
  card: { 
    background: 'var(--bg-card)', 
    padding: '32px 24px', 
    borderRadius: '20px', 
    textAlign: 'center' as const, 
    border: '1px solid var(--border-color)' 
  },
  cardIcon: { 
    width: '64px', 
    height: '64px', 
    background: 'var(--badge-bg)', 
    borderRadius: '20px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    margin: '0 auto 20px', 
    color: 'var(--button-primary)' 
  },
  startButton: { 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '10px', 
    padding: '14px 32px', 
    fontSize: '16px', 
    background: 'var(--button-primary)', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontWeight: 500 
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
    color: 'var(--button-primary)' 
  },
  reportInfo: { 
    flex: 1 
  },
  reportTitle: { 
    fontSize: '15px', 
    fontWeight: 600, 
    margin: 0, 
    color: 'var(--text-primary)' 
  },
  reportDate: { 
    fontSize: '11px', 
    color: 'var(--text-secondary)', 
    margin: '4px 0 0' 
  },
  reportStatus: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    fontSize: '11px', 
    color: 'var(--status-completed-text)', 
    background: 'var(--status-completed-bg)', 
    padding: '4px 10px', 
    borderRadius: '20px' 
  },
  reportContent: { 
    marginBottom: '16px' 
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
    fontSize: '13px' 
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
    fontSize: '13px' 
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
    zIndex: 1000 
  },
  modalContent: { 
    background: 'var(--bg-card)', 
    borderRadius: '20px', 
    maxWidth: '600px', 
    width: '90%', 
    maxHeight: '85vh', 
    overflow: 'auto' as const, 
    position: 'relative' as const, 
    padding: '24px' 
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
    justifyContent: 'center' 
  },
};

// Add animation CSS
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default App;