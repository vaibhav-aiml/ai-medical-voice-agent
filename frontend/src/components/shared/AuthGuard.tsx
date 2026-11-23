import { useAuth } from '@clerk/clerk-react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useState } from 'react';
import LoadingScreen from './LoadingScreen';

interface Props {
  children: React.ReactNode;
}

const clerkAppearance = {
  layout: {
    socialButtonsVariant: 'blockButton' as const,
    logoPlacement: 'none' as const,
  },
  variables: {
    colorPrimary: '#2E6B5E',
    colorText: '#0f172a',
    colorInputBackground: '#ffffff',
    colorInputText: '#0f172a',
    borderRadius: '10px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  elements: {
    rootBox: {
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box' as const,
    },
    card: {
      width: '100%',
      maxWidth: '100%',
      boxShadow: 'none',
      border: 'none',
      background: 'transparent',
      padding: '0',
      margin: '0',
      boxSizing: 'border-box' as const,
    },
    cardBox: {
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box' as const,
    },
    headerTitle: {
      color: '#0f172a',
      fontSize: '20px',
      fontWeight: '700',
    },
    headerSubtitle: {
      color: '#64748b',
      fontSize: '14px',
    },
    socialButtonsBlockButton: {
      width: '100%',
      minHeight: '44px',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      boxSizing: 'border-box' as const,
    },
    formFieldInput: {
      minHeight: '44px',
      borderRadius: '10px',
      borderColor: '#cbd5e1',
      fontSize: '15px',
      boxSizing: 'border-box' as const,
      width: '100%',
    },
    formButtonPrimary: {
      minHeight: '44px',
      borderRadius: '10px',
      backgroundColor: '#2E6B5E',
      fontSize: '15px',
      fontWeight: '600',
      width: '100%',
      boxSizing: 'border-box' as const,
    },
    footerActionLink: {
      color: '#2E6B5E',
      fontWeight: '600',
    },
    footer: {
      background: 'transparent',
    },
  },
};

export default function AuthGuard({ children }: Props) {
  const { isSignedIn, isLoaded } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  // Allow automated visual testing in dev mode via dev=true query parameter or session flag
  const isDevBypass = import.meta.env.DEV && (
    window.location.search.includes('dev=true') ||
    sessionStorage.getItem('dev_auth') === 'true'
  );

  if (isDevBypass) {
    return <>{children}</>;
  }

  if (!isLoaded) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!isSignedIn) {
    return (
      <div style={styles.signInContainer}>
        <div style={styles.signInCard}>
          <div style={styles.brandHeader}>
            <span style={styles.brandIcon} role="img" aria-label="Hospital">🏥</span>
            <h1 style={styles.title}>AI Medical Voice Agent</h1>
            <p style={styles.subtitle}>
              {isSignUp ? 'Create your medical account' : 'Sign in to access your consultations'}
            </p>
          </div>
          
          <div style={styles.clerkContainer}>
            {isSignUp ? (
              <SignUp 
                routing="virtual"
                afterSignUpUrl="/"
                signInUrl="/"
                redirectUrl="/"
                appearance={clerkAppearance}
              />
            ) : (
              <SignIn 
                routing="virtual"
                afterSignInUrl="/"
                signUpUrl="/"
                redirectUrl="/"
                appearance={clerkAppearance}
              />
            )}
          </div>
          
          <div style={styles.switchContainer}>
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              style={styles.switchButton}
            >
              {isSignUp 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'var(--accent-clinical)',
  },
  loader: {
    width: '50px',
    height: '50px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid var(--accent-clinical)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  signInContainer: {
    minHeight: '100dvh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #1e453d 0%, #2E6B5E 50%, #24544a 100%)',
    padding: 'clamp(12px, 3vw, 24px)',
    boxSizing: 'border-box' as const,
  },
  signInCard: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: 'clamp(20px, 4vw, 36px)',
    maxWidth: '440px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    textAlign: 'center' as const,
    boxSizing: 'border-box' as const,
    overflow: 'hidden',
  },
  brandHeader: {
    marginBottom: '16px',
  },
  brandIcon: {
    fontSize: '36px',
    marginBottom: '6px',
    display: 'inline-block',
  },
  title: {
    fontSize: 'clamp(20px, 5vw, 24px)',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: 'clamp(13px, 3.5vw, 14px)',
    color: '#64748b',
    margin: 0,
    lineHeight: 1.4,
  },
  clerkContainer: {
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  switchContainer: {
    marginTop: '16px',
    paddingTop: '14px',
    borderTop: '1px solid #f1f5f9',
  },
  switchButton: {
    background: 'transparent',
    border: 'none',
    color: '#2E6B5E',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    textDecoration: 'underline',
  },
};