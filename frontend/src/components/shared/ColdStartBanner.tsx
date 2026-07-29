import { useState, useEffect, useRef } from 'react';
import backendStatus, { BackendState } from '../../services/backendStatus';

/**
 * Non-blocking inline banner shown when the backend is waking up from cold start.
 * Subscribes to backendStatus (read-only). Dismisses automatically when awake.
 */
export default function ColdStartBanner() {
  const [state, setState] = useState<BackendState>(backendStatus.getState());
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const unsub = backendStatus.subscribe((newState) => {
      setState(newState);
    });
    return unsub;
  }, []);

  // Elapsed timer when waking
  useEffect(() => {
    if (state === 'waking') {
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state]);

  if (state === 'unknown' || state === 'awake') return null;

  const isUnavailable = state === 'unavailable';

  return (
    <div style={styles.banner} role="status" aria-live="polite">
      <div style={styles.content}>
        <div style={styles.iconRow}>
          {!isUnavailable ? (
            <div style={styles.spinner} />
          ) : (
            <span style={styles.errorIcon}>⚠️</span>
          )}
          <div style={styles.textCol}>
            <strong style={styles.title}>
              {isUnavailable
                ? 'Server unavailable'
                : 'Starting server...'}
            </strong>
            <span style={styles.subtitle}>
              {isUnavailable
                ? 'Could not reach the server after multiple attempts.'
                : `This may take 20–30 seconds. Elapsed: ${elapsed}s`}
            </span>
          </div>
        </div>

        {/* Progress bar (only while waking) */}
        {!isUnavailable && (
          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressBar,
                width: `${Math.min((elapsed / 40) * 100, 95)}%`,
              }}
            />
          </div>
        )}

        {/* Retry button (only when unavailable) */}
        {isUnavailable && (
          <button
            onClick={() => backendStatus.userRetry()}
            style={styles.retryButton}
          >
            Retry Connection
          </button>
        )}
      </div>

      {/* Inline CSS for spinner animation */}
      <style>{`
        @keyframes csb-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes csb-progress {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  banner: {
    position: 'sticky' as const,
    top: 0,
    zIndex: 900,
    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
    borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
    padding: '14px 24px',
    color: '#e2e8f0',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  iconRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  spinner: {
    width: '22px',
    height: '22px',
    border: '3px solid rgba(255,255,255,0.15)',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'csb-spin 0.8s linear infinite',
    flexShrink: 0,
  },
  errorIcon: {
    fontSize: '22px',
    flexShrink: 0,
  },
  textCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#f1f5f9',
  },
  subtitle: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  progressTrack: {
    width: '100%',
    height: '4px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)',
    backgroundSize: '200% 100%',
    animation: 'csb-progress 2s ease-in-out infinite',
    borderRadius: '4px',
    transition: 'width 1s ease-out',
  },
  retryButton: {
    alignSelf: 'flex-start',
    padding: '8px 20px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};
