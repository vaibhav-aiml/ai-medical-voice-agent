import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  Mic, Stethoscope, ClipboardList, ArrowRight,
  Sparkles, MessageCircle, Clock, CheckCircle, Star, Mail, Shield, Calendar,
  Volume2, VolumeX, ChevronDown, LucideIcon
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../context/LanguageContext';
import { useConsultation } from '../context/ConsultationContext';
import SkeletonLoader from '../components/shared/SkeletonLoader';
import heroMedicalImg from '../assets/images/hero_medical.png';
import ctaMedicalImg from '../assets/images/cta_medical.png';
import heroMedicalVideo from '../assets/videos/hero_medical.mp4';

const EnhancedSymptomChecker = lazy(() => import('../components/health/EnhancedSymptomChecker'));

interface FeatureItem {
  id: string;
  panelId: string;
  icon: LucideIcon;
  titleKey: string;
  tagKey: string;
  descKey: string;
  softBg?: boolean;
  details: string[];
}

const FEATURE_ITEMS: FeatureItem[] = [
  {
    id: 'voice-consultation',
    panelId: 'feature-details-voice-consultation',
    icon: Mic,
    titleKey: 'home.featureVoice',
    tagKey: 'home.realTime',
    descKey: 'home.featureVoiceDesc',
    softBg: true,
    details: [
      'Speaks and listens in real time — describe symptoms out loud, no typing required',
      'Streams the AI\'s response back as it\'s generated, so you\'re not staring at a loading spinner',
      'Every conversation is automatically transcribed and saved to your consultation history',
      'Supports multiple Indian languages, not just English',
    ],
  },
  {
    id: 'specialists',
    panelId: 'feature-details-specialists',
    icon: Stethoscope,
    titleKey: 'home.featureSpecialists',
    tagKey: 'home.multiSpecialty',
    descKey: 'home.featureSpecialistsDesc',
    softBg: true,
    details: [
      'Choose from General Physician, Orthopedic, Cardiologist, Pediatrician, or Neurologist specialist modes',
      'Each specialist mode includes field-specific safety guidance relevant to that specialty',
      'Switch specialists between consultations based on your symptoms — you\'re not locked into one',
      'More specialties are planned as the platform grows',
    ],
  },
  {
    id: 'medical-reports',
    panelId: 'feature-details-medical-reports',
    icon: ClipboardList,
    titleKey: 'home.featureReports',
    tagKey: 'home.instantDownload',
    descKey: 'home.featureReportsDesc',
    softBg: false,
    details: [
      'Generates a structured SOAP-format report — the same format doctors use',
      'Available as a PDF download immediately after your consultation ends',
      'Includes your symptoms, the AI\'s assessment, and a triage urgency level',
      'A useful starting point for an in-person doctor visit, not a replacement for one',
    ],
  },
  {
    id: 'appointment-booking',
    panelId: 'feature-details-appointment-booking',
    icon: Calendar,
    titleKey: 'home.featureAppointments',
    tagKey: 'home.easyBooking',
    descKey: 'home.featureAppointmentsDesc',
    softBg: false,
    details: [
      'Schedule a follow-up with your preferred specialist directly after a consultation',
      'Get reminders so you don\'t miss a booked slot',
      'Reschedule or cancel anytime from your account',
    ],
  },
  {
    id: 'email-reports',
    panelId: 'feature-details-email-reports',
    icon: Mail,
    titleKey: 'home.featureEmail',
    tagKey: 'home.shareWithDoctors',
    descKey: 'home.featureEmailDesc',
    softBg: false,
    details: [
      'Your medical report can be sent straight to your inbox, formatted and ready to read',
      'Share the same report with a doctor by email in one click',
      'Keeps a copy outside the app, so you\'re not dependent on staying logged in to access it',
    ],
  },
  {
    id: 'secure-private',
    panelId: 'feature-details-secure-private',
    icon: Shield,
    titleKey: 'home.featureSecure',
    tagKey: 'home.hipaaCompliant',
    descKey: 'home.featureSecureDesc',
    softBg: false,
    details: [
      'Personal identifying details are automatically redacted before being sent for AI processing',
      'Data is encrypted in transit, and access is scoped so only you and clinics you\'re connected to can see your records',
      'Built with India\'s DPDP Act 2023 in mind, alongside international data-protection practices',
      'Clinic staff can only access patients within their own clinic, not other clinics\' data',
    ],
  },
];

function FeatureCardItem({
  item,
  isExpanded,
  isReceded,
  prefersReducedMotion,
  onToggle,
  t,
}: {
  item: FeatureItem;
  isExpanded: boolean;
  isReceded: boolean;
  prefersReducedMotion: boolean;
  onToggle: () => void;
  t: (key: string) => string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const Icon = item.icon;

  // Pre-measure scrollHeight on mount so initial expand animates smoothly
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, []);

  // ResizeObserver active only while card is expanded; disconnects cleanly on collapse or unmount
  useEffect(() => {
    if (!isExpanded || !contentRef.current) return;

    setContentHeight(contentRef.current.scrollHeight);

    if (typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
        if (height > 0) {
          setContentHeight(Math.ceil(height));
        }
      }
    });

    ro.observe(contentRef.current);

    return () => {
      ro.disconnect();
    };
  }, [isExpanded]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    } else if (e.key === 'Escape' && isExpanded) {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-controls={item.panelId}
      aria-label={`${t(item.titleKey)}: ${isExpanded ? 'Collapse details' : 'Expand details'}`}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      className={`feature-card ${isExpanded ? 'is-expanded' : ''} ${isReceded ? 'is-receded' : ''}`}
      style={{
        ...styles.featureCard,
        ...(item.softBg ? { background: 'var(--accent-clinical-soft)' } : {}),
      }}
    >
      <div style={styles.featureCardHeader}>
        <div className="feature-card-icon" style={styles.featureIcon}>
          <Icon size={24} />
        </div>
        <div className="feature-card-chevron" aria-hidden="true">
          <ChevronDown size={20} />
        </div>
      </div>
      <h3 style={styles.featureTitle}>{t(item.titleKey)}</h3>
      <div style={styles.featureTag}>{t(item.tagKey)}</div>
      <p style={styles.featureDesc}>{t(item.descKey)}</p>

      <div
        id={item.panelId}
        role="region"
        aria-label={`${t(item.titleKey)} details`}
        aria-hidden={!isExpanded}
        className={`feature-card-accordion ${isExpanded ? 'is-open' : 'is-collapsed'}`}
        style={{
          maxHeight: prefersReducedMotion
            ? (isExpanded ? 'none' : '0px')
            : (isExpanded ? (contentHeight > 0 ? `${contentHeight}px` : '320px') : '0px'),
        }}
      >
        <div ref={contentRef} className="feature-card-details-inner">
          <ul className="feature-details-list">
            {item.details.map((bullet, idx) => (
              <li key={idx} className="feature-detail-item">
                <span className="feature-detail-bullet" aria-hidden="true">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { isMobile, isTablet } = useBreakpoint();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { stats, handleSymptomCheckerConsultation } = useConsultation();
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [showEnhancedSymptomChecker, setShowEnhancedSymptomChecker] = useState(false);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  // Global Escape listener — attached only while a feature card is open, removed immediately on collapse/unmount
  useEffect(() => {
    if (expandedFeature === null) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpandedFeature(null);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [expandedFeature]);

  // --- Hero video state ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  // --- Visual enhancement state (no logic changes) ---
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const [statsVisible, setStatsVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [howItWorksVisible, setHowItWorksVisible] = useState(false);
  const [testimonialsVisible, setTestimonialsVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

  // Detect reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Determine whether video should render at all
  const showVideo = !prefersReducedMotion && !isMobile && !videoFailed;

  // Sync the muted DOM property via ref (not just JSX attribute)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Attempt autoplay explicitly and handle rejection gracefully
  useEffect(() => {
    if (!showVideo || !videoRef.current) return;

    videoRef.current
      .play()
      .then(() => setIsVideoPlaying(true))
      .catch(() => {
        // Autoplay was rejected — leave the poster visible, keep the mute
        // button hidden, and do not surface an error to the console.
        setIsVideoPlaying(false);
      });
  }, [showVideo]);

  // Pause when the tab is hidden, resume when visible
  useEffect(() => {
    if (!showVideo) return;

    const handleVisibility = () => {
      if (!videoRef.current) return;
      if (document.hidden) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [showVideo]);

  // Hero mouse parallax (±5px, disabled on touch/reduced-motion)
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (prefersReducedMotion) return;
    const { clientX, clientY, currentTarget } = e;
    const rect = currentTarget.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width - 0.5) * 10; // ±5px
    const y = ((clientY - rect.top) / rect.height - 0.5) * 10;
    setParallaxOffset({ x, y });
  }, [prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    setParallaxOffset({ x: 0, y: 0 });
  }, []);

  // Intersection Observer for scroll fade-up effects across all sections
  useEffect(() => {
    if (prefersReducedMotion) {
      setStatsVisible(true);
      setFeaturesVisible(true);
      setHowItWorksVisible(true);
      setTestimonialsVisible(true);
      setCtaVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === statsRef.current) setStatsVisible(true);
            if (entry.target === featuresRef.current) setFeaturesVisible(true);
            if (entry.target === howItWorksRef.current) setHowItWorksVisible(true);
            if (entry.target === testimonialsRef.current) setTestimonialsVisible(true);
            if (entry.target === ctaRef.current) setCtaVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    if (featuresRef.current) observer.observe(featuresRef.current);
    if (howItWorksRef.current) observer.observe(howItWorksRef.current);
    if (testimonialsRef.current) observer.observe(testimonialsRef.current);
    if (ctaRef.current) observer.observe(ctaRef.current);

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <>
      <div style={styles.homeContainer}>
        {/* --- Hero with background image + parallax --- */}
        <div
          style={styles.heroWrapper}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Background video or static image fallback layer */}
          {showVideo ? (
            <video
              ref={videoRef}
              style={{
                ...styles.heroBgImage,
                objectFit: 'cover' as const,
                width: '100%',
                height: '100%',
                pointerEvents: 'none' as const,
              }}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={heroMedicalImg}
              onError={() => setVideoFailed(true)}
            >
              <source src={heroMedicalVideo} type="video/mp4" />
            </video>
          ) : (
            <div style={{
              ...styles.heroBgImage,
              backgroundImage: `url(${heroMedicalImg})`,
              transform: prefersReducedMotion ? 'none' : `translate(${parallaxOffset.x}px, ${parallaxOffset.y}px) scale(1.05)`,
            }} />
          )}
          {/* Dark overlay */}
          <div style={styles.heroBgOverlay} />
          {/* Mute/unmute toggle — only shown once video is confirmed playing */}
          {showVideo && isVideoPlaying && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const nextMuted = !isMuted;
                if (videoRef.current) {
                  videoRef.current.muted = nextMuted;
                }
                setIsMuted(nextMuted);
              }}
              aria-label={isMuted ? 'Unmute background video' : 'Mute background video'}
              style={{
                position: 'absolute' as const,
                bottom: 16,
                right: 16,
                zIndex: 10,
                background: 'rgba(15,23,42,0.6)',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
                transition: 'background 0.2s ease',
              }}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          )}
          {/* Waveform accent behind heading */}
          {!prefersReducedMotion && (
            <svg style={styles.heroWaveformAccent} viewBox="0 0 200 40" preserveAspectRatio="none">
              <path d="M0,20 Q10,5 20,20 T40,20 T60,20 T80,20 T100,20 T120,20 T140,20 T160,20 T180,20 T200,20" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          )}
        <div style={{...styles.heroSection, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr'}}>
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
              <span>{t('home.voiceConsultation') === 'home.voiceConsultation' ? 'Voice Consultation' : t('home.voiceConsultation')}</span>
            </div>
            <div style={styles.floatingCard2}>
              <Stethoscope size={24} color="#0284c7" />
              <span>{t('home.specialists') === 'home.specialists' ? 'Specialists' : t('home.specialists')}</span>
            </div>
            <div style={styles.floatingCard3}>
              <ClipboardList size={24} color="#f59e0b" />
              <span>{t('home.medicalReports') === 'home.medicalReports' ? 'Medical Reports' : t('home.medicalReports')}</span>
            </div>
            <div style={styles.heroCircle}></div>
            {/* Floating medical icons (3, very low opacity) */}
            {!prefersReducedMotion && (
              <>
                <svg style={{ ...styles.floatingIcon, top: '10%', left: '5%', animationDuration: '10s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2v20M2 12h20" />
                </svg>
                <svg style={{ ...styles.floatingIcon, bottom: '15%', right: '5%', animationDuration: '12s', animationDelay: '2s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <svg style={{ ...styles.floatingIcon, top: '60%', left: '60%', animationDuration: '8s', animationDelay: '1s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="6" width="4" height="12" rx="1" />
                  <rect x="10" y="2" width="4" height="20" rx="1" />
                  <rect x="18" y="8" width="4" height="8" rx="1" />
                </svg>
              </>
            )}
          </div>
        </div>
        </div>

        {/* Stats Section with scroll fade-up */}
        <div
          ref={statsRef}
          style={{
            ...styles.statsSection,
            opacity: statsVisible ? 1 : 0,
            transform: statsVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: prefersReducedMotion ? 'none' : 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{...styles.statsContainer, gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(4, 1fr)'}}>
            <div
              className="stat-cell"
              style={{
                ...styles.statCard,
                borderRight: isMobile ? 'none' : isTablet ? '1px solid var(--border-color)' : '1px solid var(--border-color)',
                borderBottom: isMobile ? '1px solid var(--border-color)' : isTablet ? '1px solid var(--border-color)' : 'none',
              }}
            >
              <div style={styles.statIcon}><MessageCircle size={18} /></div>
              <div style={styles.statNumber}>{stats.totalConsultations}</div>
              <div style={styles.statLabel}>{t('home.totalConsultations')}</div>
              <div style={styles.statTrend}>↑ 12% {t('home.thisMonth')}</div>
            </div>
            <div
              className="stat-cell"
              style={{
                ...styles.statCard,
                borderRight: isMobile ? 'none' : isTablet ? 'none' : '1px solid var(--border-color)',
                borderBottom: isMobile ? '1px solid var(--border-color)' : isTablet ? '1px solid var(--border-color)' : 'none',
              }}
            >
              <div style={styles.statIcon}><CheckCircle size={18} /></div>
              <div style={styles.statNumberSecondary}>{stats.completedConsultations}</div>
              <div style={styles.statLabel}>{t('home.completed')}</div>
              <div style={styles.statTrend}>↑ 8% {t('home.thisMonth')}</div>
            </div>
            <div
              className="stat-cell"
              style={{
                ...styles.statCard,
                borderRight: isMobile ? 'none' : isTablet ? '1px solid var(--border-color)' : '1px solid var(--border-color)',
                borderBottom: isMobile ? '1px solid var(--border-color)' : 'none',
              }}
            >
              <div style={styles.statIcon}><Clock size={18} /></div>
              <div style={styles.statNumberSecondary}>{stats.averageDuration}</div>
              <div style={styles.statLabel}>{t('home.avgMinutes')}</div>
              <div style={styles.statTrend}>↓ 5% {t('home.faster')}</div>
            </div>
            <div
              className="stat-cell"
              style={styles.statCard}
            >
              <div style={styles.statIcon}><Star size={18} /></div>
              <div style={styles.statNumberSecondary}>4.8</div>
              <div style={styles.statLabel}>{t('home.userRating')}</div>
              <div style={styles.statTrend}>★★★★★</div>
            </div>
          </div>
        </div>

        {/* Features with scroll fade-up */}
        <div
          ref={featuresRef}
          style={{
            ...styles.featuresSection,
            opacity: featuresVisible ? 1 : 0,
            transform: featuresVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: prefersReducedMotion ? 'none' : 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={styles.sectionHeader}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
              {t('home.whyChoose')} <span style={styles.sectionHeaderAccent}>{t('home.mediVoiceAI')}</span>
            </h2>
            <p>{t('home.featureDesc')}</p>
          </div>
          <div style={{...styles.featuresGrid, gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3, 1fr)'}}>
            {FEATURE_ITEMS.map((item) => {
              const isExpanded = expandedFeature === item.id;
              const isReceded = expandedFeature !== null && !isExpanded;
              return (
                <FeatureCardItem
                  key={item.id}
                  item={item}
                  isExpanded={isExpanded}
                  isReceded={isReceded}
                  prefersReducedMotion={prefersReducedMotion}
                  onToggle={() => setExpandedFeature(prev => prev === item.id ? null : item.id)}
                  t={t}
                />
              );
            })}
          </div>
        </div>

        {/* How It Works with animated gradient & scroll fade-up */}
        <div
          ref={howItWorksRef}
          style={{
            ...styles.howItWorksSection,
            background: prefersReducedMotion
              ? 'linear-gradient(135deg, rgba(37,99,235,0.04), rgba(79,70,229,0.04))'
              : undefined,
            ...(prefersReducedMotion ? {} : styles.animatedGradientBg),
            opacity: howItWorksVisible ? 1 : 0,
            transform: howItWorksVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: prefersReducedMotion ? 'none' : 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
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

        {/* Testimonials with scroll fade-up */}
        <div
          ref={testimonialsRef}
          style={{
            ...styles.testimonialsSection,
            opacity: testimonialsVisible ? 1 : 0,
            transform: testimonialsVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: prefersReducedMotion ? 'none' : 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={styles.sectionHeader}>
            <h2>{t('home.whatUsersSay')} <span style={styles.sectionHeaderAccent}>{t('home.aboutUs')}</span></h2>
            <p>{t('home.trustedBy')}</p>
          </div>
          <div style={{...styles.testimonialsGrid, gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3, 1fr)'}}>
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

        {/* CTA with background image + scroll fade-up */}
        <div
          ref={ctaRef}
          style={{
            ...styles.ctaWrapper,
            opacity: ctaVisible ? 1 : 0,
            transform: ctaVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: prefersReducedMotion ? 'none' : 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <img
            src={ctaMedicalImg}
            alt=""
            loading="lazy"
            style={styles.ctaBgImage}
          />
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
      </div>

      {}
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
  // --- Hero wrapper with bg image ---
  heroWrapper: {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    margin: '0 24px 40px',
    borderRadius: '20px',
  },
  heroBgImage: {
    position: 'absolute' as const,
    top: '-10px',
    left: '-10px',
    right: '-10px',
    bottom: '-10px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'transform 0.15s ease-out',
    zIndex: 0,
  },
  heroBgOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(15,23,42,0.88) 0%, rgba(30,27,75,0.82) 50%, rgba(15,23,42,0.88) 100%)',
    zIndex: 1,
  },
  heroWaveformAccent: {
    position: 'absolute' as const,
    top: '35%',
    left: '5%',
    width: '200px',
    height: '40px',
    opacity: 0.06,
    color: '#3b82f6',
    zIndex: 1,
    animation: 'heroWaveformPulse 3s ease-in-out infinite',
  },
  floatingIcon: {
    position: 'absolute' as const,
    width: '28px',
    height: '28px',
    opacity: 0.05,
    color: '#3b82f6',
    animation: 'floatSlow ease-in-out infinite',
    zIndex: 1,
    pointerEvents: 'none' as const,
  },
  heroSection: {
    position: 'relative' as const,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '60px',
    padding: '60px 40px',
    background: 'transparent',
    alignItems: 'center',
    borderRadius: '20px',
    margin: '0',
    zIndex: 2,
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
  statsContainer: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', overflow: 'hidden' },
  statCard: { textAlign: 'center' as const, padding: '28px 20px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s ease' },
  statIcon: { color: '#2563eb', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statNumber: { fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 },
  statNumberSecondary: { fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 },
  statLabel: { fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' },
  statTrend: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' },
  featuresSection: { padding: '60px 24px', maxWidth: '1200px', margin: '0 auto' },
  sectionHeader: { textAlign: 'center' as const, marginBottom: '48px' },
  sectionHeaderAccent: {
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', alignItems: 'start' },
  featureCard: { padding: '32px', background: 'var(--bg-card)', borderRadius: '24px' },
  featureCardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  featureIcon: { width: '52px', height: '52px', borderRadius: '50%', border: '1.5px solid rgba(37, 99, 235, 0.25)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 0, flexShrink: 0, transition: 'all 0.25s ease' },
  featureTitle: { fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' },
  featureTag: { fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '12px' },
  featureDesc: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 },
  // --- CTA wrapper with bg image ---
  ctaWrapper: {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    margin: '40px 24px 60px',
    borderRadius: '20px',
    minHeight: '200px',
  },
  ctaBgImage: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    opacity: 0.65,
    zIndex: 0,
  },
  ctaSection: { position: 'relative' as const, zIndex: 1, margin: '0', padding: '60px', background: 'linear-gradient(135deg, rgba(37,99,235,0.5), rgba(124,58,237,0.5))', borderRadius: '20px', textAlign: 'center' as const, color: 'white', boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)' },
  ctaContent: { maxWidth: '600px', margin: '0 auto' },
  ctaButton: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', background: 'white', color: '#2563eb', border: 'none', borderRadius: '9999px', cursor: 'pointer', fontSize: '16px', fontWeight: 600, marginTop: '24px', transition: 'all 0.25s ease' },
  howItWorksSection: { padding: '60px 24px', background: 'var(--bg-secondary)' },
  animatedGradientBg: {
    background: 'linear-gradient(-45deg, rgba(37,99,235,0.04), rgba(79,70,229,0.04), rgba(124,58,237,0.04), rgba(37,99,235,0.04))',
    backgroundSize: '400% 400%',
    animation: 'gradientShift 20s ease infinite',
  },
  stepsContainer: { maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' as const },
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