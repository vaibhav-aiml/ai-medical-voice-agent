import { useAuth } from '@clerk/clerk-react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: Props) {
  const { isSignedIn, isLoaded } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  if (!isLoaded) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p>Loading...</p>
      </div>
    );
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  loader: {
    width: '50px',
    height: '50px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  signInContainer: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
    color: '#667eea',
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
    color: '#667eea',
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'underline',
  },
};