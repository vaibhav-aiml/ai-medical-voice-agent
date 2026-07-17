import { useState, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router';
import { X } from 'lucide-react';
import AuthGuard from './components/shared/AuthGuard';
import Header from './components/shared/Header';
import Footer from './components/shared/Footer';
import SkeletonLoader from './components/shared/SkeletonLoader';
import { useLanguage } from './context/LanguageContext';
import { ConsultationProvider, useConsultation } from './context/ConsultationContext';
import { useAuthInterceptor } from './hooks/useAuthInterceptor';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ConsultationPage = lazy(() => import('./pages/ConsultationPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const RemindersPage = lazy(() => import('./pages/RemindersPage'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const VoiceConsultationPage = lazy(() => import('./pages/VoiceConsultation'));
const HIPAACompliance = lazy(() => import('./pages/HIPAACompliance'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));

// Lazy load modal components
const SymptomChecker = lazy(() => import('./components/health/SymptomChecker'));
const HealthTips = lazy(() => import('./components/health/HealthTips'));
const EmergencyContacts = lazy(() => import('./components/health/EmergencyContacts'));
const ConsultationRating = lazy(() => import('./components/consultation/ConsultationRating'));
const HealthGoals = lazy(() => import('./components/health/HealthGoals'));
const VoiceCustomization = lazy(() => import('./components/voice/VoiceCustomization'));
const ProgressDashboard = lazy(() => import('./components/dashboard/ProgressDashboard'));
const TwoFactorAuth = lazy(() => import('./components/profile/TwoFactorAuth'));
const DataExport = lazy(() => import('./components/profile/DataExport'));
const VoiceEnrollmentModal = lazy(() => import('./components/voice/VoiceEnrollmentModal'));
const VideoConsultation = lazy(() => import('./components/VideoConsultation'));
const MedicalReportModal = lazy(() => import('./components/reports/MedicalReportModal'));
const AppointmentBooking = lazy(() => import('./components/appointments/AppointmentBooking'));
const MyAppointments = lazy(() => import('./components/appointments/MyAppointments'));
const PricingPlans = lazy(() => import('./components/subscription/PricingPlans'));
const EnhancedReportViewer = lazy(() => import('./components/reports/EnhancedReportViewer'));
const DoctorAnalyticsDashboard = lazy(() => import('./components/dashboard/DoctorAnalyticsDashboard'));
const ClinicDashboard = lazy(() => import('./components/clinic/ClinicDashboard'));
const FHIRConnector = lazy(() => import('./components/clinic/FHIRConnector'));

function AppContent() {
  // Set up global auth interceptors
  useAuthInterceptor();

  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Access consultation context for modals
  const ctx = useConsultation();

  // Non-consultation modal state (simple open/close toggles)
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const [showHealthTips, setShowHealthTips] = useState(false);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
  const [showHealthGoals, setShowHealthGoals] = useState(false);
  const [showVoiceCustomization, setShowVoiceCustomization] = useState(false);
  const [showProgressDashboard, setShowProgressDashboard] = useState(false);
  const [showTwoFactorAuth, setShowTwoFactorAuth] = useState(false);
  const [showDataExport, setShowDataExport] = useState(false);
  const [showAppointmentsList, setShowAppointmentsList] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  if (ctx.loading) {
    return <SkeletonLoader />;
  }

  const isMinimalPage = ['/about', '/contact', '/terms', '/privacy', '/hipaa', '/cookies'].includes(location.pathname);
  const showPageNav = location.pathname !== '/' &&
    !['/about', '/contact', '/terms', '/privacy', '/hipaa', '/cookies', '/voice-consultation'].includes(location.pathname);

  return (
    <div style={styles.app}>
      {!isMinimalPage && (
        <Header
          setShowSymptomChecker={setShowSymptomChecker}
          setShowHealthTips={setShowHealthTips}
          setShowEmergencyContacts={setShowEmergencyContacts}
          setShowHealthGoals={setShowHealthGoals}
          setShowVoiceCustomization={setShowVoiceCustomization}
          setShowProgressDashboard={setShowProgressDashboard}
          setShowDataExport={setShowDataExport}
          setShowTwoFactorAuth={setShowTwoFactorAuth}
          setShowAppointmentsList={setShowAppointmentsList}
          setShowVoiceBiometricsEnrollment={ctx.setShowVoiceBiometricsEnrollment}
          setShowFHIRConnector={ctx.setShowFHIRConnector}
          onNewConsultation={ctx.handleNewConsultation}
          onUpgrade={() => setShowPricing(true)}
          onOpenReminders={() => navigate('/reminders')}
          userName={ctx.getUserName()}
        />
      )}

      {showPageNav && (
        <div style={styles.pageNav}>
          <button onClick={() => navigate('/')} style={styles.pageNavButton}>
            ← {t('common.back')} {t('nav.home')}
          </button>
          <span style={styles.pageNavTitle}>
            {location.pathname === '/dashboard' && t('nav.dashboard')}
            {location.pathname === '/consultation' && t('consultation.title')}
            {location.pathname === '/reports' && t('reports.title')}
          </span>
        </div>
      )}

      <Suspense fallback={<SkeletonLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/consultation" element={<ConsultationPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/hipaa" element={<HIPAACompliance />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          <Route path="/voice-consultation" element={<VoiceConsultationPage />} />
        </Routes>
      </Suspense>

      {/* ===== Modals (non-routed overlays) ===== */}

      {/* Regular Symptom Checker Modal */}
      {showSymptomChecker && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button onClick={() => setShowSymptomChecker(false)} style={styles.modalClose}><X size={18} /></button>
            <Suspense fallback={<div>Loading...</div>}>
              <SymptomChecker onClose={() => setShowSymptomChecker(false)} />
            </Suspense>
          </div>
        </div>
      )}

      {/* Enhanced Report Modal */}
      {ctx.showEnhancedReport && ctx.selectedReportData && (
        <Suspense fallback={null}>
          <EnhancedReportViewer
            consultationData={ctx.selectedReportData}
            onClose={() => ctx.setShowEnhancedReport(false)}
          />
        </Suspense>
      )}

      {/* Doctor Analytics Dashboard Modal */}
      {ctx.showAnalytics && (
        <Suspense fallback={null}>
          <DoctorAnalyticsDashboard
            consultations={ctx.consultations}
            ratings={JSON.parse(localStorage.getItem('consultationRatings') || '{}')}
            onClose={() => ctx.setShowAnalytics(false)}
          />
        </Suspense>
      )}

      {ctx.showVoiceBiometricsEnrollment && (
        <Suspense fallback={null}>
          <VoiceEnrollmentModal
            onClose={() => ctx.setShowVoiceBiometricsEnrollment(false)}
            userId={ctx.getCurrentUserId()}
          />
        </Suspense>
      )}

      {/* Clinic Dashboard Modal */}
      {ctx.showClinicDashboard && ctx.currentClinicId && (
        <div style={styles.modalOverlayFull}>
          <div style={styles.modalFullContent}>
            <button onClick={() => ctx.setShowClinicDashboard(false)} style={styles.modalCloseBtn}>×</button>
            <Suspense fallback={<div style={{ padding: '40px', color: '#fff', textAlign: 'center' }}>Loading Clinic...</div>}>
              <ClinicDashboard clinicId={ctx.currentClinicId} />
            </Suspense>
          </div>
        </div>
      )}

      {ctx.showReportModal && ctx.selectedConsultation && (
        <Suspense fallback={null}>
          <MedicalReportModal
            consultationId={ctx.selectedConsultation.id}
            specialistType={ctx.selectedConsultation.specialistType}
            symptoms={ctx.selectedConsultation.symptoms || 'No symptoms recorded'}
            onClose={() => ctx.setShowReportModal(false)}
            onResume={() => ctx.handleResumeConsultation(ctx.selectedConsultation!.id)}
          />
        </Suspense>
      )}
      {ctx.showAppointmentModal && ctx.currentConsultationForAppointment && (
        <Suspense fallback={null}>
          <AppointmentBooking consultationId={ctx.currentConsultationForAppointment.id} specialistType={ctx.currentConsultationForAppointment.specialistType} specialistName={ctx.currentConsultationForAppointment.specialistName} patientName={ctx.getUserName()} onClose={() => ctx.setShowAppointmentModal(false)} onBooked={(apt) => { console.log('Appointment booked:', apt); ctx.setShowAppointmentModal(false); alert(t('appointments.booked') || '✅ Appointment booked successfully!'); }} />
        </Suspense>
      )}
      {showHealthTips && (
        <Suspense fallback={null}>
          <HealthTips onClose={() => setShowHealthTips(false)} />
        </Suspense>
      )}
      {showEmergencyContacts && (
        <Suspense fallback={null}>
          <EmergencyContacts onClose={() => setShowEmergencyContacts(false)} />
        </Suspense>
      )}
      {ctx.showRatingModal && ctx.selectedRatingConsultation && (
        <Suspense fallback={null}>
          <ConsultationRating
            consultationId={ctx.selectedRatingConsultation.id}
            consultationTitle={`${t('reports.consultationWith')} ${ctx.selectedRatingConsultation.specialistName}`}
            onClose={() => ctx.setShowRatingModal(false)}
            onSubmit={ctx.handleRatingSubmit}
          />
        </Suspense>
      )}
      {showHealthGoals && (
        <Suspense fallback={null}>
          <HealthGoals onClose={() => setShowHealthGoals(false)} />
        </Suspense>
      )}
      {showVoiceCustomization && (
        <Suspense fallback={null}>
          <VoiceCustomization onClose={() => setShowVoiceCustomization(false)} />
        </Suspense>
      )}
      {showProgressDashboard && (
        <Suspense fallback={null}>
          <ProgressDashboard onClose={() => setShowProgressDashboard(false)} />
        </Suspense>
      )}
      {showTwoFactorAuth && (
        <Suspense fallback={null}>
          <TwoFactorAuth onClose={() => setShowTwoFactorAuth(false)} />
        </Suspense>
      )}
      {showDataExport && (
        <Suspense fallback={null}>
          <DataExport onClose={() => setShowDataExport(false)} />
        </Suspense>
      )}
      {ctx.showFHIRConnector && (
        <Suspense fallback={null}>
          <FHIRConnector
            userId={ctx.getCurrentUserId()}
            consultations={ctx.consultations}
            onClose={() => ctx.setShowFHIRConnector(false)}
          />
        </Suspense>
      )}
      {ctx.showVideoConsultation && ctx.selectedVideoConsultation && (
        <Suspense fallback={null}>
          <VideoConsultation
            consultationId={ctx.selectedVideoConsultation.id}
            specialistName={ctx.selectedVideoConsultation.specialistName}
            specialistType={ctx.selectedVideoConsultation.specialistType}
            onClose={() => ctx.setShowVideoConsultation(false)}
            onEndCall={() => {
              ctx.setShowVideoConsultation(false);
              alert(t('consultation.videoEnded') || 'Video consultation ended. A report will be generated.');
            }}
          />
        </Suspense>
      )}

      {showAppointmentsList && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button onClick={() => setShowAppointmentsList(false)} style={styles.modalClose}><X size={18} /></button>
            <Suspense fallback={<div>Loading...</div>}>
              <MyAppointments />
            </Suspense>
          </div>
        </div>
      )}

      {showPricing && (
        <Suspense fallback={null}>
          <PricingPlans onClose={() => setShowPricing(false)} />
        </Suspense>
      )}

      <Footer
        setCurrentPage={(page: string) => {
          // Map old page names to routes
          const routeMap: Record<string, string> = {
            home: '/', dashboard: '/dashboard', reports: '/reports',
            consultation: '/consultation', reminders: '/reminders',
            about: '/about', contact: '/contact', terms: '/terms',
            privacy: '/privacy', hipaa: '/hipaa', cookies: '/cookies',
          };
          const route = routeMap[page];
          if (route) {
            navigate(route);
            window.scrollTo(0, 0);
          }
        }}
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
      <ConsultationProvider>
        <AppContent />
      </ConsultationProvider>
    </AuthGuard>
  );
}

const styles: Record<string, React.CSSProperties> = {
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
  modalOverlay: {
    position: 'fixed' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalOverlayFull: {
    position: 'fixed' as const,
    top: 0, left: 0, right: 0, bottom: 0,
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
    top: '16px', right: '16px',
    background: 'rgba(0,0,0,0.5)',
    border: 'none', cursor: 'pointer', color: 'white',
    width: '32px', height: '32px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1001, fontSize: '20px',
  },
  modalClose: {
    position: 'absolute' as const,
    top: '16px', right: '16px',
    background: 'var(--badge-bg)',
    border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
    width: '32px', height: '32px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
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