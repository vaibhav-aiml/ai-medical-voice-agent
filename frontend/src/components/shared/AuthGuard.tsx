import { useAuth } from '@clerk/clerk-react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useState } from 'react';
import LoadingScreen from './LoadingScreen';

interface Props {
  children: React.ReactNode;
}

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
          <h1 style={styles.title}>🏥 AI Medical Voice Agent</h1>
          <p style={styles.subtitle}>
            {isSignUp ? 'Create a new account' : 'Sign in to access your medical consultations'}
          </p>
          
          {isSignUp ? (
            <SignUp 
              routing="virtual"
              afterSignUpUrl="/"
              signInUrl="/"
              redirectUrl="/"
            />
          ) : (
            <SignIn 
              routing="virtual"
              afterSignInUrl="/"
              signUpUrl="/"
              redirectUrl="/"
            />
          )}
          
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
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'var(--accent-clinical)',
    padding: '20px',
  },
  signInCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    textAlign: 'center' as const,
  },
  title: {
    fontSize: '28px',
    color: 'var(--accent-clinical)',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '30px',
  },
  switchContainer: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
  },
  switchButton: {
    background: 'transparent',
    border: 'none',
    color: 'var(--accent-clinical)',
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'underline',
  },
};