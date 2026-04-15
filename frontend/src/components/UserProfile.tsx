import { useUser, useClerk } from '@clerk/clerk-react';

interface Props {
  onClose: () => void;
}

export default function UserProfile({ onClose }: Props) {
  const { user } = useUser();
  const { signOut } = useClerk();

  if (!user) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>👤 User Profile</h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>
        
        <div style={styles.content}>
          <div style={styles.avatarContainer}>
            {user.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" style={styles.avatar} />
            ) : (
              <div style={styles.avatarPlaceholder}>
                {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          
          <div style={styles.infoSection}>
            <h3>Personal Information</h3>
            <p><strong>Name:</strong> {user.fullName || 'Not provided'}</p>
            <p><strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}</p>
            <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div style={styles.infoSection}>
            <h3>Account Status</h3>
            <p><strong>Email verified:</strong> {user.emailAddresses[0]?.verification?.status === 'verified' ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>
        
        <div style={styles.footer}>
          <button onClick={() => signOut()} style={styles.signOutButton}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto' as const,
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #eee',
  },
  title: {
    margin: 0,
    color: '#333',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#999',
  },
  content: {
    padding: '20px',
  },
  avatarContainer: {
    textAlign: 'center' as const,
    marginBottom: '20px',
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
  },
  avatarPlaceholder: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: '#667eea',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    margin: '0 auto',
  },
  infoSection: {
    marginBottom: '20px',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px',
  },
  footer: {
    padding: '20px',
    borderTop: '1px solid #eee',
    display: 'flex',
    justifyContent: 'center',
  },
  signOutButton: {
    padding: '10px 20px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};