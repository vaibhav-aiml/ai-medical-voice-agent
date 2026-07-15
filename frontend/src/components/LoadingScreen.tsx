import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading secure portal...' }: LoadingScreenProps) {
  const [dots, setDots] = useState('');

  // Subtle animated loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      style={styles.container} 
      role="status" 
      aria-live="polite" 
      aria-label="Loading application"
    >
      <div style={styles.card}>
        {/* Animated Medical Logo Wrapper */}
        <div style={styles.logoWrapper}>
          <svg 
            width="64" 
            height="64" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            style={styles.logoSvg}
          >
            {/* Heart shape */}
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            {/* Medical Cross in the center */}
            <path d="M12 9v6" style={styles.crossPath} />
            <path d="M9 12h6" style={styles.crossPath} />
          </svg>
          {/* Circular rotating gradient ring */}
          <div style={styles.spinnerRing}></div>
        </div>

        {/* Brand Text */}
        <h1 style={styles.title}>🏥 AI Medical Voice Agent</h1>
        
        {/* Loading Message */}
        <p style={styles.message}>
          {message}
          <span style={styles.dots}>{dots}</span>
        </p>

        {/* Security / Compliance Badge */}
        <div style={styles.badge}>
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            style={{ marginRight: '6px' }}
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          HIPAA Secure Connection
        </div>
      </div>

      {/* Embedded CSS animations */}
      <style>{`
        @keyframes rotateSpinner {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.08); opacity: 1; filter: drop-shadow(0 0 8px rgba(37, 99, 235, 0.4)); }
        }
        @keyframes screenFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cardPop {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100vw',
    height: '100vh',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    zIndex: 9999,
    fontFamily: "'Inter', sans-serif",
    animation: 'screenFadeIn 0.35s ease-out forwards',
    overflow: 'hidden' as const,
  },
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 30px',
    borderRadius: '24px',
    background: 'var(--bg-card)',
    boxShadow: 'var(--card-shadow)',
    border: '1px solid var(--border-color)',
    maxWidth: '420px',
    width: '90%',
    textAlign: 'center' as const,
    animation: 'cardPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    transition: 'all 0.3s ease',
  },
  logoWrapper: {
    position: 'relative' as const,
    width: '96px',
    height: '96px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  logoSvg: {
    color: 'var(--button-primary)',
    animation: 'heartbeat 1.8s infinite ease-in-out',
    zIndex: 2,
  },
  crossPath: {
    stroke: 'var(--bg-card)',
    strokeWidth: 2.5,
  },
  spinnerRing: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '50%',
    border: '3px solid var(--border-light)',
    borderTop: '3px solid var(--button-primary)',
    animation: 'rotateSpinner 1s linear infinite',
    zIndex: 1,
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '8px',
    letterSpacing: '-0.025em',
  },
  message: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    marginBottom: '24px',
    fontWeight: 500,
    display: 'flex',
    justifyContent: 'center',
    width: '180px',
    textAlign: 'left' as const,
  },
  dots: {
    display: 'inline-block',
    width: '20px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    borderRadius: '20px',
    background: 'var(--status-completed-bg)',
    color: 'var(--status-completed-text)',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.02em',
  },
};
