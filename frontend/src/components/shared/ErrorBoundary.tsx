import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '2rem',
          margin: '2rem auto',
          maxWidth: '500px',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          backgroundColor: '#fef2f2',
          color: '#991b1b',
          fontFamily: 'sans-serif'
        }}>
          <h2 style={{ marginTop: 0 }}>🏥 Something went wrong</h2>
          <p>We apologize for the inconvenience. An unexpected error occurred while loading this section.</p>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', fontSize: '0.85rem', cursor: 'pointer' }}>
            {this.state.error && this.state.error.toString()}
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
