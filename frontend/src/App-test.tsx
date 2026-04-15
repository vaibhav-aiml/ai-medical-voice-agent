import { useAuth, useUser } from '@clerk/clerk-react';
import AuthGuard from './components/AuthGuard';

function AppContent() {
  const { user } = useUser();

  return (
    <div style={{ padding: '20px' }}>
      <h1>MediVoice AI</h1>
      <p>Welcome {user?.fullName || user?.emailAddresses[0]?.emailAddress}</p>
      <p>All components are present!</p>
      <button onClick={() => alert('Working!')}>Test</button>
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