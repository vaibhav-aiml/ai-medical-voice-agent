import { useState, useEffect, useCallback } from 'react';

interface StartupExperienceProps {
  /** Whether the underlying application is ready (auth loaded, route set) */
  appReady: boolean;
}

const MIN_DURATION = 2000;
const MAX_DURATION = 3500;

const STEPS = [
  'Initializing Secure Consultation...',
  'Connecting AI Engine...',
  'Loading Workspace...',
];

export default function StartupExperience({ appReady }: StartupExperienceProps) {
  const [visible, setVisible] = useState(() => {
    // Show only once per login session
    if (sessionStorage.getItem('medivoice_startup_shown') === '1') return false;
    return true;
  });
  const [fadingOut, setFadingOut] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Dismiss handler
  const dismiss = useCallback(() => {
    if (fadingOut) return;
    setFadingOut(true);
    sessionStorage.setItem('medivoice_startup_shown', '1');
    setTimeout(() => setVisible(false), 500);
  }, [fadingOut]);

  // Track elapsed time and advance steps
  useEffect(() => {
    if (!visible || fadingOut) return;

    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 100;

        // Advance steps based on elapsed time
        if (next >= 1200 && currentStep < 1) setCurrentStep(1);
        if (next >= 2000 && currentStep < 2) setCurrentStep(2);

        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [visible, fadingOut, currentStep]);

  // Smart dismiss: (elapsed >= MIN && appReady) || elapsed >= MAX
  useEffect(() => {
    if (!visible || fadingOut) return;

    if (elapsed >= MAX_DURATION) {
      dismiss();
    } else if (elapsed >= MIN_DURATION && appReady) {
      dismiss();
    }
  }, [elapsed, appReady, visible, fadingOut, dismiss]);

  if (!visible) return null;

  const progress = Math.min((elapsed / MAX_DURATION) * 100, 100);

  return (
    <div
      style={{
        ...styles.overlay,
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.5s ease',
      }}
      onClick={dismiss}
      role="presentation"
      aria-label="Application loading"
    >
      <div style={styles.content}>
        {/* App name */}
        <h1 style={styles.title}>MediVoice AI</h1>

        {/* Voice waveform animation */}
        {!prefersReducedMotion && (
          <div style={styles.waveformContainer}>
            <div style={{ ...styles.waveBar, animationDuration: '0.8s' }} />
            <div style={{ ...styles.waveBar, animationDuration: '1.1s', animationDelay: '0.15s' }} />
            <div style={{ ...styles.waveBar, animationDuration: '0.9s', animationDelay: '0.3s' }} />
          </div>
        )}

        {/* Status text */}
        <p style={styles.statusText}>{STEPS[currentStep]}</p>

        {/* Progress bar */}
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progress}%`,
              transition: prefersReducedMotion ? 'none' : 'width 0.3s ease',
            }}
          />
        </div>

        {/* Skip hint */}
        <p style={styles.skipHint}>Click anywhere to skip</p>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes startupWaveBar {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    padding: '40px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#f1f5f9',
    letterSpacing: '-0.03em',
    margin: 0,
  },
  waveformContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    height: '40px',
  },
  waveBar: {
    width: '4px',
    height: '100%',
    background: 'linear-gradient(180deg, #3b82f6, #8b5cf6)',
    borderRadius: '2px',
    transformOrigin: 'center',
    animation: 'startupWaveBar ease-in-out infinite',
  },
  statusText: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#94a3b8',
    margin: 0,
    letterSpacing: '0.02em',
    minHeight: '20px',
  },
  progressTrack: {
    width: '240px',
    height: '3px',
    background: 'rgba(148, 163, 184, 0.15)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
    borderRadius: '2px',
  },
  skipHint: {
    fontSize: '12px',
    color: 'rgba(148, 163, 184, 0.4)',
    margin: 0,
    marginTop: '16px',
  },
};
