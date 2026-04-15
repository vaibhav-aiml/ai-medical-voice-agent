import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { 
  Home, LayoutDashboard, FileText, Calendar, Plus, User, Mic, Stethoscope,
  ClipboardList, ArrowRight, Download, X, Activity, Brain, Heart, Bone, Baby,
  Sparkles, MessageCircle, Clock, CheckCircle
} from 'lucide-react';
import AuthGuard from './components/AuthGuard';
import SpecialistSelector from './components/SpecialistSelector';
import VoiceRecorder from './components/VoiceRecorder';
import ChatMessages from './components/ChatMessages';
import ConsultationHistory from './components/ConsultationHistory';
import DashboardStatsComponent from './components/DashboardStats';
import MedicalReportModal from './components/MedicalReportModal';
import AppointmentBooking from './components/AppointmentBooking';
import MyAppointments from './components/MyAppointments';
import { api } from './services/api';
import { Message, ConsultationSession, DashboardStats } from './types/consultation.types';

function AppContent() {
  const { userId } = useAuth();
  const { user } = useUser();
  const [currentPage, setCurrentPage] = useState('home');
  const [showConsultation, setShowConsultation] = useState(false);
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [consultationId, setConsultationId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [consultationStarted, setConsultationStarted] = useState(false);
  const [consultations, setConsultations] = useState<ConsultationSession[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationSession | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showAppointmentsList, setShowAppointmentsList] = useState(false);
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
    setShowConsultation(false);
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
    setShowConsultation(true);
    setConsultationStarted(false);
    setSelectedSpecialist('');
    setMessages([]);
    setManualSymptoms('');
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
        <p style={{ marginTop: '20px', color: '#4a5568' }}>Loading your consultations...</p>
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
            <button onClick={() => setCurrentPage('home')} style={styles.navButton}><Home size={18} /><span>Home</span></button>
            <button onClick={() => { setCurrentPage('dashboard'); setRefreshKey(prev => prev + 1); }} style={styles.navButton}><LayoutDashboard size={18} /><span>Dashboard</span></button>
            <button onClick={() => setCurrentPage('reports')} style={styles.navButton}><FileText size={18} /><span>Reports</span></button>
            <button onClick={() => setShowAppointmentsList(true)} style={styles.navButton}><Calendar size={18} /><span>Appointments</span></button>
            <button onClick={() => { setCurrentPage('consultation'); setShowConsultation(true); setConsultationStarted(false); setMessages([]); setManualSymptoms(''); }} style={styles.consultButton}><Plus size={18} /><span>New Consultation</span></button>
          </div>
        </div>
      </nav>

      {currentPage === 'home' && (
        <div style={styles.hero}>
          <div style={styles.heroContent}>
            <div style={styles.badge}><Sparkles size={14} /><span>AI-Powered Healthcare</span></div>
            <h1 style={styles.title}>Welcome back, <span style={styles.titleAccent}>{getUserName()}</span></h1>
            <p style={styles.subtitle}>Your personal AI medical assistant. Get instant advice from specialized doctors, anytime, anywhere.</p>
            
            <div style={styles.statsRow}>
              <div style={styles.statItem}><div style={styles.statIcon}><MessageCircle size={20} /></div><div><div style={styles.statValue}>{stats.totalConsultations}</div><div style={styles.statLabel}>Consultations</div></div></div>
              <div style={styles.statDivider}></div>
              <div style={styles.statItem}><div style={styles.statIcon}><CheckCircle size={20} /></div><div><div style={styles.statValue}>{stats.completedConsultations}</div><div style={styles.statLabel}>Completed</div></div></div>
              <div style={styles.statDivider}></div>
              <div style={styles.statItem}><div style={styles.statIcon}><Clock size={20} /></div><div><div style={styles.statValue}>{stats.averageDuration}</div><div style={styles.statLabel}>Avg Minutes</div></div></div>
            </div>

            <div style={styles.features}>
              <div style={styles.card}><div style={styles.cardIcon}><Mic size={28} /></div><h3>Voice Consultation</h3><p>Speak naturally and get real-time AI responses</p></div>
              <div style={styles.card}><div style={styles.cardIcon}><Stethoscope size={28} /></div><h3>5+ Specialists</h3><p>General, Orthopedic, Cardiologist & more</p></div>
              <div style={styles.card}><div style={styles.cardIcon}><ClipboardList size={28} /></div><h3>Medical Reports</h3><p>Download detailed PDF reports instantly</p></div>
            </div>

            <button onClick={() => { setCurrentPage('consultation'); setShowConsultation(true); }} style={styles.startButton}>Start Consultation <ArrowRight size={18} /></button>
          </div>
        </div>
      )}

      {currentPage === 'dashboard' && (
        <div style={styles.pageContainer}>
          <div style={styles.pageHeader}><h2 style={styles.pageTitle}>Dashboard</h2><p style={styles.pageSubtitle}>Overview of your medical consultations</p></div>
          <DashboardStatsComponent stats={stats} />
          <ConsultationHistory consultations={consultations} onViewReport={handleViewReport} onNewConsultation={handleNewConsultation} />
        </div>
      )}

      {currentPage === 'consultation' && (
        <div style={styles.consultationContainer}>
          <div style={styles.consultationHeader}>
            <div><h2 style={styles.consultationTitle}>AI Medical Consultation</h2><p style={styles.consultationSubtitle}>Get expert advice from our AI specialists</p></div>
            <button onClick={() => setCurrentPage('home')} style={styles.closeButton}><X size={20} /></button>
          </div>
          {!consultationStarted ? (
            <div style={styles.setupSection}>
              <SpecialistSelector selectedSpecialist={selectedSpecialist} onSelect={setSelectedSpecialist} />
              <button onClick={startConsultation} disabled={!selectedSpecialist} style={styles.startConsultButton}>Start Consultation with {selectedSpecialist || 'Selected Specialist'}</button>
            </div>
          ) : (
            <div style={styles.activeConsultation}>
              <div style={styles.specialistInfo}>
                <div style={styles.specialistBadge}>{getSpecialistIcon(selectedSpecialist)}<span>{selectedSpecialist} Specialist</span></div>
                <button onClick={endConsultation} style={styles.endButton}>End Consultation</button>
              </div>
              <VoiceRecorder consultationId={consultationId} specialistType={selectedSpecialist} onTranscriptUpdate={handleTranscriptUpdate} onAIResponse={handleAIResponse} />
              <ChatMessages messages={messages} />
            </div>
          )}
        </div>
      )}

      {currentPage === 'reports' && (
        <div style={styles.pageContainer}>
          <div style={styles.pageHeader}><h2 style={styles.pageTitle}>Medical Reports</h2><p style={styles.pageSubtitle}>Access and download your consultation reports</p></div>
          <div style={styles.reportsList}>
            {consultations.filter(c => c.status === 'completed').map((consultation) => (
              <div key={consultation.id} style={styles.reportCard}>
                <div style={styles.reportHeader}>
                  <div style={styles.reportIconArea}>{getSpecialistIcon(consultation.specialistType)}</div>
                  <div style={styles.reportInfo}><h3 style={styles.reportTitle}>{consultation.specialistName}</h3><p style={styles.reportDate}>{new Date(consultation.startedAt).toLocaleDateString()}</p></div>
                  <div style={styles.reportStatus}><CheckCircle size={14} color="#10b981" /><span>Completed</span></div>
                </div>
                <div style={styles.reportContent}><p><strong>Symptoms:</strong> {consultation.symptoms?.substring(0, 100)}...</p><p><strong>Duration:</strong> {consultation.duration} minutes</p></div>
                <div style={styles.reportActions}>
                  <button onClick={() => handleViewReport(consultation.id)} style={styles.downloadButton}><Download size={16} /><span>View Report</span></button>
                  <button onClick={() => handleBookAppointment(consultation)} style={styles.bookButton}><Calendar size={16} /><span>Book Follow-up</span></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showReportModal && selectedConsultation && <MedicalReportModal consultationId={selectedConsultation.id} specialistType={selectedConsultation.specialistType} symptoms={selectedConsultation.symptoms || 'No symptoms recorded'} onClose={() => setShowReportModal(false)} />}
      {showAppointmentModal && currentConsultationForAppointment && <AppointmentBooking consultationId={currentConsultationForAppointment.id} specialistType={currentConsultationForAppointment.specialistType} specialistName={currentConsultationForAppointment.specialistName} onClose={() => setShowAppointmentModal(false)} onBooked={(apt) => { console.log('Appointment booked:', apt); setShowAppointmentModal(false); alert('✅ Appointment booked successfully!'); }} />}
      
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
  app: { minHeight: '100vh', background: '#f0f9ff' },
  loadingContainer: { display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f9ff' },
  loader: { width: '50px', height: '50px', border: '3px solid #e0e7ff', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  nav: { background: 'white', padding: '1rem 0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'sticky' as const, top: 0, zIndex: 100, borderBottom: '1px solid #e5e7eb' },
  navContent: { maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '16px' },
  logoContainer: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
  logoIcon: { width: '36px', height: '36px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' },
  logo: { fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  navLinks: { display: 'flex', gap: '6px', flexWrap: 'wrap' as const, alignItems: 'center' },
  navButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'transparent', border: 'none', borderRadius: '10px', cursor: 'pointer', color: '#64748b', fontSize: '0.875rem', fontWeight: 500 },
  consultButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 },
  hero: { minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' },
  heroContent: { maxWidth: '1200px', textAlign: 'center' as const },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#e0e7ff', padding: '6px 16px', borderRadius: '50px', color: '#3b82f6', fontSize: '0.75rem', fontWeight: 500, marginBottom: '24px' },
  title: { fontSize: '48px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', letterSpacing: '-0.02em' },
  titleAccent: { color: '#3b82f6' },
  subtitle: { fontSize: '18px', color: '#64748b', marginBottom: '48px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 },
  statsRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', marginBottom: '64px', background: 'white', padding: '24px 48px', borderRadius: '60px', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' },
  statItem: { display: 'flex', alignItems: 'center', gap: '12px' },
  statIcon: { width: '40px', height: '40px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' },
  statValue: { fontSize: '20px', fontWeight: 700, color: '#1e293b' },
  statLabel: { fontSize: '12px', color: '#64748b' },
  statDivider: { width: '1px', height: '30px', background: '#e2e8f0' },
  features: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '48px' },
  card: { background: 'white', padding: '32px 24px', borderRadius: '20px', textAlign: 'center' as const, border: '1px solid #e5e7eb' },
  cardIcon: { width: '64px', height: '64px', background: '#eff6ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#3b82f6' },
  startButton: { display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 32px', fontSize: '16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 500 },
  pageContainer: { maxWidth: '1280px', margin: '40px auto', padding: '0 24px' },
  pageHeader: { marginBottom: '32px' },
  pageTitle: { fontSize: '28px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' },
  pageSubtitle: { fontSize: '14px', color: '#64748b' },
  consultationContainer: { maxWidth: '1200px', margin: '40px auto', padding: '32px', background: 'white', borderRadius: '24px', border: '1px solid #e5e7eb' },
  consultationTitle: { fontSize: '22px', fontWeight: 600, color: '#1e293b' },
  consultationSubtitle: { fontSize: '13px', color: '#64748b', marginTop: '4px' },
  consultationHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' },
  closeButton: { background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '8px', borderRadius: '8px' },
  setupSection: { padding: '20px' },
  startConsultButton: { marginTop: '30px', padding: '14px 28px', fontSize: '16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 500, width: '100%' },
  activeConsultation: { padding: '20px' },
  specialistInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '14px 20px', background: '#f8fafc', borderRadius: '12px' },
  specialistBadge: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 500, color: '#3b82f6' },
  endButton: { padding: '8px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' },
  reportsList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' },
  reportCard: { background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e5e7eb' },
  reportHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' },
  reportIconArea: { width: '40px', height: '40px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' },
  reportInfo: { flex: 1 },
  reportTitle: { fontSize: '15px', fontWeight: 600, margin: 0, color: '#1e293b' },
  reportDate: { fontSize: '11px', color: '#64748b', margin: '4px 0 0' },
  reportStatus: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#10b981', background: '#ecfdf5', padding: '4px 10px', borderRadius: '20px' },
  reportContent: { marginBottom: '16px' },
  reportActions: { display: 'flex', gap: '12px' },
  downloadButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flex: 1, padding: '10px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' },
  bookButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flex: 1, padding: '10px', background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' },
  modalOverlay: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: 'white', borderRadius: '20px', maxWidth: '600px', width: '90%', maxHeight: '85vh', overflow: 'auto' as const, position: 'relative' as const, padding: '24px' },
  modalClose: { position: 'absolute' as const, top: '16px', right: '16px', background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
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