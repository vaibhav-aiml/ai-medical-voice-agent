export default function SkeletonLoader() {
  return (
    <div style={styles.container}>
      {/* Hero Section Skeleton */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.skeletonBadge}></div>
          <div style={styles.skeletonTitle}></div>
          <div style={styles.skeletonSubtitle}></div>
          <div style={styles.skeletonButtons}>
            <div style={styles.skeletonButton}></div>
            <div style={styles.skeletonButtonOutline}></div>
          </div>
        </div>
        <div style={styles.heroImage}>
          <div style={styles.skeletonCard}></div>
          <div style={styles.skeletonCard}></div>
          <div style={styles.skeletonCard}></div>
        </div>
      </div>

      {/* Stats Section Skeleton */}
      <div style={styles.statsSection}>
        <div style={styles.statsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={styles.statCard}>
              <div style={styles.skeletonIcon}></div>
              <div style={styles.skeletonStat}></div>
              <div style={styles.skeletonLabel}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section Skeleton */}
      <div style={styles.featuresSection}>
        <div style={styles.skeletonSectionHeader}></div>
        <div style={styles.featuresGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={styles.featureCard}>
              <div style={styles.skeletonFeatureIcon}></div>
              <div style={styles.skeletonFeatureTitle}></div>
              <div style={styles.skeletonFeatureDesc}></div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Skeleton */}
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

      {/* Testimonials Skeleton */}
      <div style={styles.testimonialsSection}>
        <div style={styles.skeletonSectionHeader}></div>
        <div style={styles.testimonialsGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={styles.testimonialCard}>
              <div style={styles.skeletonStars}></div>
              <div style={styles.skeletonTestimonialText}></div>
              <div style={styles.skeletonAuthor}>
                <div style={styles.skeletonAvatar}></div>
                <div style={styles.skeletonAuthorInfo}>
                  <div style={styles.skeletonName}></div>
                  <div style={styles.skeletonTitle}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Skeleton */}
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
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '24px',
      padding: '40px 20px',
    },
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
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  skeletonBadge: {
    width: '150px',
    height: '28px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '20px',
    marginBottom: '20px',
  },
  skeletonTitle: {
    width: '80%',
    height: '60px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  skeletonSubtitle: {
    width: '100%',
    height: '80px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
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
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '12px',
  },
  skeletonButtonOutline: {
    width: '140px',
    height: '50px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '12px',
  },
  skeletonCard: {
    position: 'absolute' as const,
    width: '200px',
    height: '60px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
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
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
    },
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
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '16px',
    margin: '0 auto 16px',
  },
  skeletonStat: {
    width: '60px',
    height: '36px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '8px',
    margin: '0 auto 8px',
  },
  skeletonLabel: {
    width: '80px',
    height: '14px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
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
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
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
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '20px',
    },
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
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '20px',
    marginBottom: '20px',
  },
  skeletonFeatureTitle: {
    width: '150px',
    height: '24px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '6px',
    marginBottom: '12px',
  },
  skeletonFeatureDesc: {
    width: '100%',
    height: '60px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
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
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      gap: '20px',
    },
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
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '8px',
  },
  skeletonStepIcon: {
    width: '64px',
    height: '64px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '50%',
    margin: '0 auto 16px',
  },
  skeletonStepTitle: {
    width: '120px',
    height: '20px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '6px',
    margin: '0 auto 12px',
  },
  skeletonStepDesc: {
    width: '80%',
    height: '40px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
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
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '20px',
    },
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
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '4px',
    marginBottom: '16px',
  },
  skeletonTestimonialText: {
    width: '100%',
    height: '80px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
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
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
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
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '4px',
    marginBottom: '6px',
  },
  skeletonTitle: {
    width: '60px',
    height: '12px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
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
    '@media (max-width: 768px)': {
      margin: '40px 16px 60px',
      padding: '40px 20px',
    },
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

// Add shimmer animation CSS
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
`;
document.head.appendChild(styleSheet);