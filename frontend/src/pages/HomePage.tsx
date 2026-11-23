import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import MobileCarousel from '../components/shared/MobileCarousel';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  Mic, Stethoscope, ClipboardList, ArrowRight,
  MessageCircle, Clock, CheckCircle, Star, Mail, Shield, Calendar,
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
  key?: string | number;
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
  const showVideo = !prefersReducedMotion && !videoFailed;

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

  const floatingCardMobileOverride: React.CSSProperties = isMobile ? {
    position: 'static',
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
    animation: 'none',
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: '12px',
  } : {};

  return (
    <>
      <div style={styles.homeContainer}>
        {/* --- Hero with background image + parallax --- */}
        <div
          style={{
            ...styles.heroWrapper,
            ...(isMobile ? { margin: '0 12px 24px' } : {})
          }}
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

        <div style={{
          ...styles.heroSection,
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          ...(isMobile ? { padding: '32px 16px', gap: '28px' } : {})
        }}>
          <div style={styles.heroContent}>
            <h1 style={{
              ...styles.heroTitle,
              ...(isMobile ? { fontSize: '28px', lineHeight: 1.2, marginBottom: '12px' } : {})
            }}>
              {t('home.yourHealth')}<br />
              <span style={{ color: 'var(--accent-clinical)' }}>{t('home.ourPriority')}</span>
            </h1>
            <p style={{
              ...styles.heroSubtitle,
              ...(isMobile ? { fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' } : {})
            }}>
              {t('home.subtitle')}
            </p>
            <div style={{
              ...styles.heroButtons,
              ...(isMobile ? { flexDirection: 'column', gap: '12px', width: '100%' } : {})
            }}>
              <button
                onClick={() => navigate('/consultation')}
                style={{
                  ...styles.primaryButton,
                  ...(isMobile ? { width: '100%', justifyContent: 'center', minHeight: '48px', padding: '14px 20px' } : {})
                }}
              >
                {t('home.startConsultation')}
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => setShowEnhancedSymptomChecker(true)}
                style={{
                  ...styles.secondaryButton,
                  ...(isMobile ? { width: '100%', justifyContent: 'center', minHeight: '48px', padding: '14px 20px' } : {})
                }}
              >
                {t('home.checkSymptoms')}
              </button>
            </div>
          </div>
          <div style={{
            ...styles.heroImage,
            ...(isMobile ? { height: 'auto', width: '100%', flexDirection: 'column' as const } : {})
          }}>
            <div style={{ ...styles.floatingCard1, ...floatingCardMobileOverride }}>
              <Mic size={24} color="var(--accent-clinical)" />
              <span>{t('home.voiceConsultation') === 'home.voiceConsultation' ? 'Voice Consultation' : t('home.voiceConsultation')}</span>
            </div>
            <div style={{ ...styles.floatingCard2, ...floatingCardMobileOverride }}>
              <Stethoscope size={24} color="var(--accent-clinical)" />
              <span>{t('home.specialists') === 'home.specialists' ? 'Specialists' : t('home.specialists')}</span>
            </div>
            <div style={{ ...styles.floatingCard3, ...floatingCardMobileOverride, ...(isMobile ? { marginBottom: 0 } : {}) }}>
              <ClipboardList size={24} color="var(--accent-clinical)" />
              <span>{t('home.medicalReports') === 'home.medicalReports' ? 'Medical Reports' : t('home.medicalReports')}</span>
            </div>
          </div>
        </div>
        </div>
        {/* Stats Section with scroll fade-up */}
        <div
          ref={statsRef}
          style={{
            ...styles.statsSection,
            ...(isMobile ? { padding: '24px 12px' } : {}),
            opacity: statsVisible ? 1 : 0,
            transform: statsVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: prefersReducedMotion ? 'none' : 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{...styles.statsContainer, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? '1fr 1fr' : 'repeat(4, 1fr)'}}>
            <div
              className="stat-cell"
              style={{
                ...styles.statCard,
                ...(isMobile ? { padding: '20px 12px' } : {}),
                borderRight: '1px solid var(--border-color)',
                borderBottom: isMobile ? '1px solid var(--border-color)' : isTablet ? '1px solid var(--border-color)' : 'none',
              }}
            >
              <div style={styles.statIcon}><MessageCircle size={isMobile ? 16 : 18} /></div>
              <div style={{...styles.statNumber, ...(isMobile ? { fontSize: '28px' } : {})}}>{stats.totalConsultations}</div>
              <div style={{...styles.statLabel, ...(isMobile ? { fontSize: '11px' } : {})}}>{t('home.totalConsultations')}</div>
            </div>
            <div
              className="stat-cell"
              style={{
                ...styles.statCard,
                ...(isMobile ? { padding: '20px 12px' } : {}),
                borderRight: isMobile ? 'none' : isTablet ? 'none' : '1px solid var(--border-color)',
                borderBottom: isMobile ? '1px solid var(--border-color)' : isTablet ? '1px solid var(--border-color)' : 'none',
              }}
            >
              <div style={styles.statIcon}><CheckCircle size={isMobile ? 16 : 18} /></div>
              <div style={{...styles.statNumberSecondary, ...(isMobile ? { fontSize: '20px' } : {})}}>{stats.completedConsultations}</div>
              <div style={{...styles.statLabel, ...(isMobile ? { fontSize: '11px' } : {})}}>{t('home.completed')}</div>
            </div>
            <div
              className="stat-cell"
              style={{
                ...styles.statCard,
                ...(isMobile ? { padding: '20px 12px' } : {}),
                borderRight: '1px solid var(--border-color)',
                borderBottom: isMobile ? 'none' : 'none',
              }}
            >
              <div style={styles.statIcon}><Clock size={isMobile ? 16 : 18} /></div>
              <div style={{...styles.statNumberSecondary, ...(isMobile ? { fontSize: '20px' } : {})}}>{stats.averageDuration}</div>
              <div style={{...styles.statLabel, ...(isMobile ? { fontSize: '11px' } : {})}}>{t('home.avgMinutes')}</div>
            </div>
            <div
              className="stat-cell"
              style={{
                ...styles.statCard,
                ...(isMobile ? { padding: '20px 12px' } : {}),
              }}
            >
              <div style={styles.statIcon}><Star size={isMobile ? 16 : 18} /></div>
              <div style={{...styles.statNumberSecondary, ...(isMobile ? { fontSize: '20px' } : {})}}>4.8</div>
              <div style={{...styles.statLabel, ...(isMobile ? { fontSize: '11px' } : {})}}>{t('home.userRating')}</div>
            </div>
          </div>
        </div>

        {/* Features with scroll fade-up */}
        <div
          ref={featuresRef}
          style={{
            ...styles.featuresSection,
            ...(isMobile ? { padding: '40px 16px' } : {}),
            opacity: featuresVisible ? 1 : 0,
            transform: featuresVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: prefersReducedMotion ? 'none' : 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{
            ...styles.sectionHeader,
            ...(isMobile ? { marginBottom: '24px' } : {})
          }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: isMobile ? '26px' : '36px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '12px'
            }}>
              {t('home.whyChoose')} <span style={styles.sectionHeaderAccent}>{t('home.mediVoiceAI')}</span>
            </h2>
            <p style={isMobile ? { fontSize: '14px' } : {}}>{t('home.featureDesc')}</p>
          </div>
          {isMobile ? (
            <MobileCarousel peekWidth={88} gap={16}>
              {FEATURE_ITEMS.map((item) => {
                const isExpanded = expandedFeature === item.id;
                return (
                  <FeatureCardItem
                    key={item.id}
                    item={item}
                    isExpanded={isExpanded}
                    isReceded={false}
                    prefersReducedMotion={prefersReducedMotion}
                    onToggle={() => setExpandedFeature(prev => prev === item.id ? null : item.id)}
                    t={t}
                  />
                );
              })}
            </MobileCarousel>
          ) : (
            <div style={{...styles.featuresGrid, gridTemplateColumns: isTablet ? '1fr 1fr' : 'repeat(3, 1fr)'}}>
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
          )}
        </div>

        {/* How It Works with animated gradient & scroll fade-up */}
        <div
          ref={howItWorksRef}
          style={{
            ...styles.howItWorksSection,
            ...(isMobile ? { padding: '40px 16px' } : {}),
            background: prefersReducedMotion
              ? 'linear-gradient(135deg, rgba(37,99,235,0.04), rgba(79,70,229,0.04))'
              : undefined,
            ...(prefersReducedMotion ? {} : styles.animatedGradientBg),
            opacity: howItWorksVisible ? 1 : 0,
            transform: howItWorksVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: prefersReducedMotion ? 'none' : 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{
            ...styles.sectionHeader,
            ...(isMobile ? { marginBottom: '24px' } : {})
          }}>
            <h2 style={isMobile ? { fontSize: '26px' } : {}}>{t('home.howItWorks')} <span style={styles.sectionHeaderAccent}>{t('home.works')}</span></h2>
            <p style={isMobile ? { fontSize: '14px' } : {}}>{t('home.clickToLearn')}</p>
          </div>
          {isMobile ? (
            <MobileCarousel peekWidth={85} gap={16}>
              {[1, 2, 3].map((stepNum) => {
                const icons = ['🎤', '🤖', '📋'];
                const titleKeys = ['home.step1Title', 'home.step2Title', 'home.step3Title'];
                const descKeys = ['home.step1Desc', 'home.step2Desc', 'home.step3Desc'];
                const detailKeys = [
                  ['home.step1Detail1', 'home.step1Detail2', 'home.step1Detail3', 'home.step1Detail4'],
                  ['home.step2Detail1', 'home.step2Detail2', 'home.step2Detail3', 'home.step2Detail4'],
                  ['home.step3Detail1', 'home.step3Detail2', 'home.step3Detail3', 'home.step3Detail4'],
                ];
                const detailIcons = [
                  ['🎙️', '🌐', '⚡', '⌨️'],
                  ['🧠', '👨‍⚕️', '💭', '📝'],
                  ['📄', '📧', '📅', '📊'],
                ];
                return (
                  <div
                    key={stepNum}
                    onClick={() => setSelectedStep(selectedStep === stepNum ? null : stepNum)}
                    style={{
                      ...styles.stepCard,
                      ...(selectedStep === stepNum ? styles.stepCardExpanded : {}),
                      flex: 'none',
                      width: '100%',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: 'var(--accent-clinical)', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' as const }}>
                      Step {stepNum} of 3
                    </div>
                    <div style={styles.stepIcon}>{icons[stepNum - 1]}</div>
                    <h3 style={styles.stepTitle}>{t(titleKeys[stepNum - 1])}</h3>
                    <p style={styles.stepDescription}>{t(descKeys[stepNum - 1])}</p>
                    {selectedStep === stepNum && (
                      <div style={styles.stepDetails}>
                        {detailKeys[stepNum - 1].map((dk, idx) => (
                          <div key={dk} style={styles.stepDetailItem}>{detailIcons[stepNum - 1][idx]} {t(dk)}</div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </MobileCarousel>
          ) : (
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
          )}
        </div>

        {/* Testimonials with scroll fade-up */}
        <div
          ref={testimonialsRef}
          style={{
            ...styles.testimonialsSection,
            ...(isMobile ? { padding: '40px 16px' } : {}),
            opacity: testimonialsVisible ? 1 : 0,
            transform: testimonialsVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: prefersReducedMotion ? 'none' : 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{
            ...styles.sectionHeader,
            ...(isMobile ? { marginBottom: '24px' } : {})
          }}>
            <h2 style={isMobile ? { fontSize: '26px' } : {}}>{t('home.whatUsersSay')} <span style={styles.sectionHeaderAccent}>{t('home.aboutUs')}</span></h2>
            <p style={isMobile ? { fontSize: '14px' } : {}}>{t('home.trustedBy')}</p>
          </div>
          {isMobile ? (
            <MobileCarousel peekWidth={90} gap={16}>
              <div style={styles.testimonialCard}>
                <div style={styles.testimonialStars}>★★★★★</div>
                <p>{t('home.testimonial1')}</p>
                <div style={styles.testimonialAuthor}>
                  <div style={{...styles.testimonialAvatar, ...(isMobile ? { width: '40px', height: '40px', fontSize: '16px' } : {})}}>R</div>
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
                  <div style={{...styles.testimonialAvatar, ...(isMobile ? { width: '40px', height: '40px', fontSize: '16px' } : {})}}>P</div>
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
                  <div style={{...styles.testimonialAvatar, ...(isMobile ? { width: '40px', height: '40px', fontSize: '16px' } : {})}}>A</div>
                  <div>
                    <strong>Amit Patel</strong>
                    <span>{t('home.verifiedUser')}</span>
                  </div>
                </div>
              </div>
            </MobileCarousel>
          ) : (
            <div style={{...styles.testimonialsGrid, gridTemplateColumns: isTablet ? '1fr 1fr' : 'repeat(3, 1fr)'}}>
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
          )}
        </div>

        {/* CTA with background image + scroll fade-up */}
        <div
          ref={ctaRef}
          style={{
            ...styles.ctaWrapper,
            ...(isMobile ? { margin: '24px 12px 40px', borderRadius: '16px' } : {}),
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
        <div style={{
          ...styles.ctaSection,
          ...(isMobile ? { padding: '36px 16px', borderRadius: '16px' } : {})
        }}>
          <div style={styles.ctaContent}>
            <h2 style={isMobile ? { fontSize: '24px', lineHeight: 1.25 } : {}}>{t('home.readyTitle')}</h2>
            <p style={isMobile ? { fontSize: '14px', lineHeight: 1.5, marginTop: '8px' } : {}}>{t('home.readyDesc')}</p>
            <button
              onClick={() => navigate('/consultation')}
              style={{
                ...styles.ctaButton,
                ...(isMobile ? { width: '100%', justifyContent: 'center', minHeight: '48px', padding: '14px 20px', marginTop: '20px' } : {})
              }}
            >
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
  heroTitle: {
    fontSize: '48px',
    fontWeight: 800,
    color: 'var(--text-primary)',
    lineHeight: 1.15,
    marginBottom: '16px',
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
    background: 'var(--accent-clinical)',
    color: 'white',
    border: 'none',
    borderRadius: '9999px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 12px var(--accent-clinical-soft)',
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
  statsSection: { padding: '40px 24px', background: 'transparent' },
  statsContainer: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', overflow: 'hidden' },
  statCard: { textAlign: 'center' as const, padding: '28px 20px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s ease' },
  statIcon: { color: 'var(--accent-clinical)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statNumber: { fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 },
  statNumberSecondary: { fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 },
  statLabel: { fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' },

  featuresSection: { padding: '60px 24px', maxWidth: '1200px', margin: '0 auto' },
  sectionHeader: { textAlign: 'center' as const, marginBottom: '48px' },
  sectionHeaderAccent: {
    color: 'var(--accent-clinical)',
  },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', alignItems: 'start' },
  featureCard: { padding: '32px', background: 'var(--bg-card)', borderRadius: '24px' },
  featureCardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  featureIcon: { width: '52px', height: '52px', borderRadius: '50%', border: '1.5px solid var(--accent-clinical-soft)', background: 'var(--accent-clinical-soft)', color: 'var(--accent-clinical)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 0, flexShrink: 0, transition: 'all 0.25s ease' },
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
    background: 'linear-gradient(-45deg, var(--accent-clinical-soft), rgba(79,70,229,0.04), var(--accent-clinical-soft))',
    backgroundSize: '400% 400%',
    animation: 'gradientShift 20s ease infinite',
  },
  stepsContainer: { maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' as const },
  stepCard: { flex: 1, textAlign: 'center' as const, padding: '32px 24px', background: 'var(--bg-card)', borderRadius: '24px', position: 'relative' as const, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', border: '1px solid var(--border-color)', cursor: 'pointer', boxShadow: 'var(--card-shadow)' },
  stepCardExpanded: { transform: 'scale(1.02)', boxShadow: '0 0 0 3px var(--accent-clinical-soft), 0 20px 40px -10px rgba(0,0,0,0.25)', borderColor: 'var(--accent-clinical)' },
  stepNumber: { position: 'absolute' as const, top: '-12px', left: '20px', fontSize: '48px', fontWeight: 800, color: 'var(--accent-clinical)', opacity: 0.2 },
  stepIcon: { fontSize: '48px', marginBottom: '16px' },
  stepTitle: { fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' },
  stepDescription: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 },
  stepArrow: { fontSize: '32px', color: 'var(--accent-clinical)', opacity: 0.7 },
  stepDetails: { marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', animation: 'fadeInUp 0.3s ease-out', background: 'var(--badge-bg)', borderRadius: '12px', padding: '16px' },
  stepDetailItem: { padding: '8px 0', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px dashed var(--border-light)' },
  testimonialsSection: { padding: '60px 24px', maxWidth: '1200px', margin: '0 auto' },
  testimonialsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' },
  testimonialCard: { padding: '28px', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-color)' },
  testimonialStars: { fontSize: '20px', color: '#f59e0b', marginBottom: '16px' },
  testimonialAuthor: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px' },
  testimonialAvatar: { width: '48px', height: '48px', background: 'var(--accent-clinical)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 600, color: 'white' },
};