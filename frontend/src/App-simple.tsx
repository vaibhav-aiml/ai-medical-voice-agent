import { useAuth, useUser } from '@clerk/clerk-react';
import AuthGuard from './components/AuthGuard';

function AppContent() {
  const { user } = useUser();

  const getUserName = () => {
    if (user?.fullName) return user.fullName.split(' ')[0];
    if (user?.firstName) return user.firstName;
    if (user?.emailAddresses[0]?.emailAddress) return user.emailAddresses[0].emailAddress.split('@')[0];
    return 'User';
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Arial' }}>
      <h1>🏥 MediVoice AI</h1>
      <p>Welcome, {getUserName()}!</p>
      <p>Frontend is working!</p>
      <button onClick={() => alert('Working!')}>Test Button</button>
    </div>
  );
}

function App() {
  return (
    <AuthGuard>
      <AppContent />
    </AuthGuard>
  );
}

export default App;