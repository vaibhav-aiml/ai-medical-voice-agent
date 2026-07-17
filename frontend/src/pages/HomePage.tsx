import { useState, lazy, Suspense } from 'react';
import {
  Mic, Stethoscope, ClipboardList, ArrowRight,
  Sparkles, MessageCircle, Clock, CheckCircle, Star, Mail, Shield, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../context/LanguageContext';
import { useConsultation } from '../context/ConsultationContext';
import SkeletonLoader from '../components/shared/SkeletonLoader';

const EnhancedSymptomChecker = lazy(() => import('../components/health/EnhancedSymptomChecker'));

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { stats, handleSymptomCheckerConsultation } = useConsultation();
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [showEnhancedSymptomChecker, setShowEnhancedSymptomChecker] = useState(false);

  return (
    <>
      <div style={styles.homeContainer}>
        {/* Hero Section */}
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
              <button onClick={() => navigate('/consultation')} style={styles.primaryButton}>
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

        {/* Stats Section */}
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

        {/* Features Section */}
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

        {/* CTA Section */}
        <div style={styles.ctaSection}>
          <div style={styles.ctaContent}>
            <h2>{t('home.readyTitle')}</h2>
            <p>{t('home.readyDesc')}</p>
            <button onClick={() => navigate('/consultation')} style={styles.ctaButton}>
              {t('home.startYourFreeConsultation')}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Symptom Checker Modal */}
      {showEnhancedSymptomChecker && (
        <Suspense fallback={<SkeletonLoader />}>
          <EnhancedSymptomChecker
            onClose={() => setShowEnhancedSymptomChecker(false)}
            onStartConsultation={handleSymptomCheckerConsultation}
          />
        </Suspense>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  homeContainer: {
    overflowX: 'hidden' as const,
  },
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
    position: 'absolute' as const, top: '20%', left: '10%',
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px',
    background: 'var(--bg-card)', borderRadius: '16px', boxShadow: 'var(--card-shadow)',
    animation: 'float 3s ease-in-out infinite', border: '1px solid var(--border-color)',
  },
  floatingCard2: {
    position: 'absolute' as const, top: '50%', right: '10%',
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px',
    background: 'var(--bg-card)', borderRadius: '16px', boxShadow: 'var(--card-shadow)',
    animation: 'float 4s ease-in-out infinite', border: '1px solid var(--border-color)',
  },
  floatingCard3: {
    position: 'absolute' as const, bottom: '20%', left: '20%',
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px',
    background: 'var(--bg-card)', borderRadius: '16px', boxShadow: 'var(--card-shadow)',
    animation: 'float 3.5s ease-in-out infinite', border: '1px solid var(--border-color)',
  },
  heroCircle: {
    position: 'absolute' as const, top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: '300px', height: '300px',
    background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0) 70%)',
    borderRadius: '50%',
  },
  statsSection: { padding: '40px 24px', background: 'transparent' },
  statsContainer: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' },
  statCard: { textAlign: 'center' as const, padding: '28px 20px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', transition: 'all 0.3s ease' },
  statIconBg: { width: '56px', height: '56px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#3b82f6' },
  statNumber: { fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)' },
  statLabel: { fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' },
  statTrend: { fontSize: '12px', color: '#10b981', marginTop: '8px' },
  featuresSection: { padding: '60px 24px', maxWidth: '1200px', margin: '0 auto' },
  sectionHeader: { textAlign: 'center' as const, marginBottom: '48px' },
  sectionHeaderAccent: { color: '#3b82f6' },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' },
  featureCard: { padding: '32px', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-color)', position: 'relative' as const, boxShadow: 'var(--card-shadow)', transition: 'all 0.3s ease' },
  featureIcon: { width: '64px', height: '64px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'white' },
  featureTag: { position: 'absolute' as const, top: '20px', right: '20px', padding: '4px 12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '9999px', fontSize: '12px', color: '#3b82f6' },
  ctaSection: { margin: '40px 24px 60px', padding: '60px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '20px', textAlign: 'center' as const, color: 'white', boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)' },
  ctaContent: { maxWidth: '600px', margin: '0 auto' },
  ctaButton: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', background: 'white', color: '#2563eb', border: 'none', borderRadius: '9999px', cursor: 'pointer', fontSize: '16px', fontWeight: 600, marginTop: '24px', transition: 'all 0.25s ease' },
  howItWorksSection: { padding: '60px 24px', background: 'var(--bg-secondary)' },
  stepsContainer: { maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' },
  stepCard: { flex: 1, textAlign: 'center' as const, padding: '32px 24px', background: 'var(--bg-card)', borderRadius: '24px', position: 'relative' as const, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', border: '1px solid var(--border-color)', cursor: 'pointer', boxShadow: 'var(--card-shadow)' },
  stepCardExpanded: { transform: 'scale(1.02)', boxShadow: '0 0 0 3px #3b82f6, 0 20px 40px -10px rgba(0,0,0,0.25)', borderColor: '#3b82f6' },
  stepNumber: { position: 'absolute' as const, top: '-12px', left: '20px', fontSize: '48px', fontWeight: 800, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', opacity: 0.3 },
  stepIcon: { fontSize: '48px', marginBottom: '16px' },
  stepTitle: { fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' },
  stepDescription: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 },
  stepArrow: { fontSize: '32px', color: '#3b82f6', opacity: 0.7 },
  stepDetails: { marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', animation: 'fadeInUp 0.3s ease-out', background: 'var(--badge-bg)', borderRadius: '12px', padding: '16px' },
  stepDetailItem: { padding: '8px 0', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px dashed var(--border-light)' },
  testimonialsSection: { padding: '60px 24px', maxWidth: '1200px', margin: '0 auto' },
  testimonialsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' },
  testimonialCard: { padding: '28px', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-color)' },
  testimonialStars: { fontSize: '20px', color: '#f59e0b', marginBottom: '16px' },
  testimonialAuthor: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px' },
  testimonialAvatar: { width: '48px', height: '48px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 600, color: 'white' },
};
