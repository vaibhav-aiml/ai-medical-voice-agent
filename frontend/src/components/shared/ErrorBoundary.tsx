import React, { Component, ErrorInfo, ReactNode } from 'react';
import logger from '../../services/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Production-grade error boundary.
 * Catches render errors anywhere in the component tree and shows a
 * recovery UI instead of a white screen. Logs errors via the structured
 * logger for production diagnostics.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('error_boundary_caught', {
      error: error.message,
      stack: error.stack?.slice(0, 500),
      componentStack: errorInfo.componentStack?.slice(0, 500),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.iconWrapper}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.message}>
              We apologize for the inconvenience. An unexpected error occurred.
              Please try reloading the application.
            </p>

            <div style={styles.actions}>
              <button onClick={this.handleReload} style={styles.primaryButton}>
                Reload Application
              </button>
              <button onClick={this.handleReset} style={styles.secondaryButton}>
                Try Again
              </button>
            </div>

            <details style={styles.details}>
              <summary style={styles.detailsSummary}>Error Details</summary>
              <pre style={styles.errorText}>
                {this.state.error?.message}
                {'\n\n'}
                {this.state.error?.stack?.slice(0, 300)}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '24px',
    background: 'linear-gradient(135deg, #0f172a, #1e293b)',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  card: {
    maxWidth: '480px',
    width: '100%',
    textAlign: 'center' as const,
    padding: '48px 32px',
    background: '#1e293b',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  iconWrapper: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#f1f5f9',
    marginBottom: '12px',
  },
  message: {
    fontSize: '15px',
    color: '#94a3b8',
    lineHeight: 1.6,
    marginBottom: '28px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap' as const,
  },
  primaryButton: {
    padding: '12px 28px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  secondaryButton: {
    padding: '12px 28px',
    background: 'transparent',
    color: '#94a3b8',
    border: '1px solid #334155',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  details: {
    textAlign: 'left' as const,
    marginTop: '16px',
  },
  detailsSummary: {
    fontSize: '12px',
    color: '#64748b',
    cursor: 'pointer',
    marginBottom: '8px',
  },
  errorText: {
    fontSize: '11px',
    color: '#ef4444',
    background: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.1)',
    borderRadius: '8px',
    padding: '12px',
    overflow: 'auto',
    maxHeight: '150px',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
  },
};

export default ErrorBoundary;
