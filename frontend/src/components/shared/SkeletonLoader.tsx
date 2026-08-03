import { useBreakpoint } from '../../hooks/useBreakpoint';

export default function SkeletonLoader() {
  const { isMobile, isTablet } = useBreakpoint();
  return (
    <div style={styles.container}>
      {}
      <div style={{...styles.heroSection, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr'}}>
        <div style={styles.heroContent}>
          <div style={styles.skeletonBadge}></div>
          <div style={styles.skeletonHeroTitle}></div>
          <div style={styles.skeletonHeroSubtitle}></div>
          <div style={styles.skeletonButtons}>
            <div style={styles.skeletonButton}></div>
            <div style={styles.skeletonButtonOutline}></div>
          </div>
        </div>
        <div style={styles.heroImage}>
          <div style={styles.skeletonCard}></div>
          <div style={styles.skeletonCard}></div>
          <div style={styles.skeletonCard}></div>
          {/* Subtle waveform branding icon */}
          <svg style={styles.skeletonWaveformIcon} viewBox="0 0 80 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="8" y="12" width="6" height="16" rx="2" />
            <rect x="20" y="6" width="6" height="28" rx="2" />
            <rect x="32" y="10" width="6" height="20" rx="2" />
            <rect x="44" y="4" width="6" height="32" rx="2" />
            <rect x="56" y="14" width="6" height="12" rx="2" />
            <rect x="68" y="8" width="6" height="24" rx="2" />
          </svg>
        </div>
      </div>

      {}
      <div style={styles.statsSection}>
        <div style={{...styles.statsGrid, gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(4, 1fr)'}}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={styles.statCard}>
              <div style={styles.skeletonIcon}></div>
              <div style={styles.skeletonStat}></div>
              <div style={styles.skeletonLabel}></div>
            </div>
          ))}
        </div>
      </div>

      {}
      <div style={styles.featuresSection}>
        <div style={styles.skeletonSectionHeader}></div>
        <div style={{...styles.featuresGrid, gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3, 1fr)'}}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={styles.featureCard}>
              <div style={styles.skeletonFeatureIcon}></div>
              <div style={styles.skeletonFeatureTitle}></div>
              <div style={styles.skeletonFeatureDesc}></div>
            </div>
          ))}
        </div>
      </div>

      {}
      <div style={styles.howItWorksSection}>
        <div style={styles.skeletonSectionHeader}></div>
        <div style={styles.stepsContainer}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={styles.stepCard}>
              <div style={styles.skeletonStepNumber}></div>
              <div style={styles.skeletonStepIcon}></div>
              <div style={styles.skeletonStepTitle}></div>
              <div style={styles.skeletonStepDesc}></div>
            </div>
          ))}
        </div>
      </div>

      {}
      <div style={styles.testimonialsSection}>
        <div style={styles.skeletonSectionHeader}></div>
        <div style={{...styles.testimonialsGrid, gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3, 1fr)'}}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={styles.testimonialCard}>
              <div style={styles.skeletonStars}></div>
              <div style={styles.skeletonTestimonialText}></div>
              <div style={styles.skeletonAuthor}>
                <div style={styles.skeletonAvatar}></div>
                <div style={styles.skeletonAuthorInfo}>
                  <div style={styles.skeletonName}></div>
                  <div style={styles.skeletonAuthorTitle}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {}
      <div style={styles.ctaSection}>
        <div style={styles.skeletonCtaTitle}></div>
        <div style={styles.skeletonCtaButton}></div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    overflow: 'hidden' as const,
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
  heroImage: {
    position: 'relative' as const,
    height: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonWaveformIcon: {
    position: 'absolute' as const,
    width: '80px',
    height: '40px',
    color: 'var(--text-muted)',
    opacity: 0.15,
    animation: 'skeletonPulse 2s ease-in-out infinite',
  },
  skeletonBadge: {
    width: '150px',
    height: '28px',
    background: 'linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-end) 37%, var(--skeleton-start) 63%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '20px',
    marginBottom: '20px',
  },
  skeletonHeroTitle: {
    width: '80%',
    height: '60px',
    background: 'linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-end) 37%, var(--skeleton-start) 63%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  skeletonHeroSubtitle: {
    width: '100%',
    height: '80px',
    background: 'linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-end) 37%, var(--skeleton-start) 63%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  skeletonButtons: {
    display: 'flex',
    gap: '16px',
  },
  skeletonButton: {
    width: '160px',
    height: '50px',
    background: 'linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-end) 37%, var(--skeleton-start) 63%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '12px',
  },
  skeletonButtonOutline: {
    width: '140px',
    height: '50px',
    background: 'linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-end) 37%, var(--skeleton-start) 63%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '12px',
  },
  skeletonCard: {
    position: 'absolute' as const,
    width: '200px',
    height: '60px',
    background: 'linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-end) 37%, var(--skeleton-start) 63%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '16px',
  },
  statsSection: {
    padding: '40px 24px',
    background: 'var(--bg-card)',
  },
  statsGrid: {
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
  },
  skeletonIcon: {
    width: '56px',
    height: '56px',
    background: 'linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-end) 37%, var(--skeleton-start) 63%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '16px',
    margin: '0 auto 16px',
  },
  skeletonStat: {
    width: '60px',
    height: '36px',
    background: 'linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-end) 37%, var(--skeleton-start) 63%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '8px',
    margin: '0 auto 8px',
  },
  skeletonLabel: {
    width: '80px',
    height: '14px',
    background: 'linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-end) 37%, var(--skeleton-start) 63%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '4px',
    margin: '0 auto',
  },
  featuresSection: {
    padding: '60px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  skeletonSectionHeader: {
    width: '300px',
    height: '30px',
    background: 'linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-end) 37%, var(--skeleton-start) 63%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '8px',
    margin: '0 auto 16px',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '32px',
    marginTop: '48px',
  },
  featureCard: {
    padding: '32px',
    background: 'var(--bg-card)',
    borderRadius: '24px',
    border: '1px solid var(--border-color)',
  },
  skeletonFeatureIcon: {
    width: '64px',
    height: '64px',
    background: 'linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-end) 37%, var(--skeleton-start) 63%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '20px',
    marginBottom: '20px',
  },
  skeletonFeatureTitle: {
    width: '150px',
    height: '24px',
    background: 'linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-end) 37%, var(--skeleton-start) 63%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '6px',
    marginBottom: '12px',
  },
  skeletonFeatureDesc: {
    width: '100%',
    height: '60px',
    background: 'linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-end) 37%, var(--skeleton-start) 63%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '8px',
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
    marginTop: '48px',
  },
  stepCard: {
    flex: 1,
    textAlign: 'center' as const,
    padding: '32px',
    background: 'var(--bg-card)',
    borderRadius: '24px',
    position: 'relative' as const,
  },
  skeletonStepNumber: {
    position: 'absolute' as const,
    top: '-12px',
    left: '20px',
    width: '40px',
    height: '30px',
    background: 'linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-end) 37%, var(--skeleton-start) 63%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '8px',
  },
  skeletonStepIcon: {
    width: '64px',
    height: '64px',
    background: 'linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-end) 37%, var(--skeleton-start) 63%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '50%',
    margin: '0 auto 16px',
  },
  skeletonStepTitle: {
    width: '120px',
    height: '20px',
    background: 'linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-end) 37%, var(--skeleton-start) 63%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '6px',
    margin: '0 auto 12px',
  },
  skeletonStepDesc: {
    width: '80%',
    height: '40px',
    background: 'linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-end) 37%, var(--skeleton-start) 63%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '6px',
    margin: '0 auto',
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
    marginTop: '48px',
  },
  testimonialCard: {
    padding: '28px',
    background: 'var(--bg-card)',
    borderRadius: '24px',
    border: '1px solid var(--border-color)',
  },
  skeletonStars: {
    width: '100px',
    height: '20px',
    background: 'linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-end) 37%, var(--skeleton-start) 63%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '4px',
    marginBottom: '16px',
  },
  skeletonTestimonialText: {
    width: '100%',
    height: '80px',
    background: 'linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-end) 37%, var(--skeleton-start) 63%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  skeletonAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  skeletonAvatar: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-end) 37%, var(--skeleton-start) 63%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '50%',
  },
  skeletonAuthorInfo: {
    flex: 1,
  },
  skeletonName: {
    width: '80px',
    height: '16px',
    background: 'linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-end) 37%, var(--skeleton-start) 63%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '4px',
    marginBottom: '6px',
  },
  skeletonAuthorTitle: {
    width: '60px',
    height: '12px',
    background: 'linear-gradient(90deg, var(--skeleton-start) 25%, var(--skeleton-end) 37%, var(--skeleton-start) 63%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '4px',
  },
  ctaSection: {
    margin: '40px 24px 60px',
    padding: '60px',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    borderRadius: '32px',
    textAlign: 'center' as const,
  },
  skeletonCtaTitle: {
    width: '300px',
    height: '30px',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '8px',
    margin: '0 auto 16px',
  },
  skeletonCtaButton: {
    width: '200px',
    height: '50px',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '12px',
    margin: '24px auto 0',
  },
};
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
  @keyframes skeletonPulse {
    0%, 100% { opacity: 0.15; transform: scale(1); }
    50% { opacity: 0.25; transform: scale(1.05); }
  }
`;
document.head.appendChild(styleSheet);