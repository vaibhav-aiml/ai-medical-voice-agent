import { useState, useRef, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { User, Settings, LogOut, Shield, Moon, Sun, Globe, Users, ChevronRight, Camera } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface Account {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface Props {
  onOpen2FA: () => void;
}

export default function ProfileDropdown({ onOpen2FA }: Props) {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = () => {
    const saved = localStorage.getItem('userAccounts');
    if (saved) {
      setAccounts(JSON.parse(saved));
    } else if (user) {
      const currentAccount = {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        name: user.fullName || user.firstName || 'User',
        avatar: user.imageUrl,
      };
      setAccounts([currentAccount]);
      localStorage.setItem('userAccounts', JSON.stringify([currentAccount]));
    }
  };

  const saveAccounts = (newAccounts: Account[]) => {
    localStorage.setItem('userAccounts', JSON.stringify(newAccounts));
    setAccounts(newAccounts);
  };

  const switchAccount = (account: Account) => {
    localStorage.setItem('currentAccount', JSON.stringify(account));
    window.location.reload();
  };

  const addAccount = () => {
    // This would redirect to Clerk sign-in for new account
    window.location.href = 'https://accounts.clerk.com/sign-up';
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const avatarUrl = e.target?.result as string;
        const updatedAccounts = accounts.map(acc => 
          acc.id === user.id ? { ...acc, avatar: avatarUrl } : acc
        );
        saveAccounts(updatedAccounts);
        localStorage.setItem(`avatar_${user.id}`, avatarUrl);
        setShowAvatarMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentAvatar = () => {
    const currentAccount = accounts.find(a => a.id === user?.id);
    if (currentAccount?.avatar) return currentAccount.avatar;
    if (user?.imageUrl) return user.imageUrl;
    return null;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowAccounts(false);
        setShowAvatarMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  ];

  return (
    <div style={styles.container} ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} style={styles.avatarButton}>
        {getCurrentAvatar() ? (
          <img src={getCurrentAvatar()} alt="Profile" style={styles.avatar} />
        ) : (
          <div style={styles.avatarPlaceholder}>
            {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || 'U'}
          </div>
        )}
      </button>

      {isOpen && (
        <div style={styles.dropdown}>
          {/* User Info */}
          <div style={styles.userInfo}>
            <div style={styles.avatarLarge}>
              {getCurrentAvatar() ? (
                <img src={getCurrentAvatar()} alt="Profile" style={styles.avatarLargeImg} />
              ) : (
                <div style={styles.avatarLargePlaceholder}>
                  {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || 'U'}
                </div>
              )}
              <button onClick={() => setShowAvatarMenu(!showAvatarMenu)} style={styles.cameraButton}>
                <Camera size={14} />
              </button>
            </div>
            <div style={styles.userName}>{user?.fullName || user?.firstName || 'User'}</div>
            <div style={styles.userEmail}>{user?.emailAddresses[0]?.emailAddress}</div>
          </div>

          {/* Avatar Change Menu */}
          {showAvatarMenu && (
            <div style={styles.avatarMenu}>
              <button onClick={() => fileInputRef.current?.click()} style={styles.avatarMenuItem}>
                <Camera size={16} /> Upload Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
            </div>
          )}

          <div style={styles.divider} />

          {/* Account Switching */}
          <button onClick={() => setShowAccounts(!showAccounts)} style={styles.menuItem}>
            <Users size={18} />
            <span>Switch Account</span>
            <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
          </button>

          {showAccounts && (
            <div style={styles.accountList}>
              {accounts.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => switchAccount(acc)}
                  style={styles.accountItem}
                >
                  {acc.avatar ? (
                    <img src={acc.avatar} alt="" style={styles.accountAvatar} />
                  ) : (
                    <div style={styles.accountAvatarPlaceholder}>
                      {acc.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div style={styles.accountName}>{acc.name}</div>
                    <div style={styles.accountEmail}>{acc.email}</div>
                  </div>
                </button>
              ))}
              <button onClick={addAccount} style={styles.addAccountButton}>
                + Add Account
              </button>
            </div>
          )}

          {/* Theme Toggle */}
          <button onClick={toggleTheme} style={styles.menuItem}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>

          {/* Language Selector */}
          <div style={styles.languageSection}>
            <Globe size={18} />
            <span>Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              style={styles.languageSelect}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>
              ))}
            </select>
          </div>

          {/* 2FA Option */}
          <button onClick={onOpen2FA} style={styles.menuItem}>
            <Shield size={18} />
            <span>Two-Factor Authentication</span>
          </button>

          <div style={styles.divider} />

          {/* Sign Out */}
          <button onClick={() => signOut()} style={{ ...styles.menuItem, ...styles.signOut }}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative' as const,
  },
  avatarButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    padding: 0,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 600,
    color: 'white',
  },
  dropdown: {
    position: 'absolute' as const,
    top: 'calc(100% + 8px)',
    right: 0,
    width: '280px',
    background: 'var(--bg-card)',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
    border: '1px solid var(--border-color)',
    zIndex: 1000,
    overflow: 'hidden',
  },
  userInfo: {
    padding: '20px',
    textAlign: 'center' as const,
    borderBottom: '1px solid var(--border-color)',
  },
  avatarLarge: {
    position: 'relative' as const,
    width: '80px',
    height: '80px',
    margin: '0 auto 12px',
  },
  avatarLargeImg: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover' as const,
  },
  avatarLargePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 600,
    color: 'white',
  },
  cameraButton: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#3b82f6',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  userName: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  userEmail: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  divider: {
    height: '1px',
    background: 'var(--border-color)',
    margin: '8px 0',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'var(--text-primary)',
    textAlign: 'left' as const,
    transition: 'background 0.2s',
  },
  signOut: {
    color: '#ef4444',
  },
  accountList: {
    padding: '8px 0',
    borderTop: '1px solid var(--border-color)',
    maxHeight: '200px',
    overflow: 'auto',
  },
  accountItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'background 0.2s',
  },
  accountAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
  },
  accountAvatarPlaceholder: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 600,
    color: 'white',
  },
  accountName: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  accountEmail: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  addAccountButton: {
    width: '100%',
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    borderTop: '1px solid var(--border-color)',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#3b82f6',
    textAlign: 'center' as const,
  },
  languageSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-color)',
  },
  languageSelect: {
    marginLeft: 'auto',
    padding: '4px 8px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  avatarMenu: {
    position: 'absolute' as const,
    top: '100px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '160px',
    background: 'var(--bg-card)',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1001,
  },
  avatarMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '8px 12px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    color: 'var(--text-primary)',
  },
};