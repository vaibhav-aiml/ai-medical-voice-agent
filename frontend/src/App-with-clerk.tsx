import { useAuth, useUser, SignIn, ClerkProvider } from '@clerk/clerk-react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_aGVscGluZy10aWdlci0xMy5jbGVyay5hY2NvdW50cy5kZXYk';

function AppContent() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isSignedIn) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h1>AI Medical Voice Agent</h1>
        <p>Please sign in to continue</p>
        <SignIn />
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}!</h1>
      <p>You are signed in! 🎉</p>
      <button onClick={() => window.location.reload()}>Refresh</button>
    </div>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <AppContent />
    </ClerkProvider>
  );
}

export default App;