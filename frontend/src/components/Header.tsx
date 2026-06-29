import { useState, useRef, useEffect } from 'react';
import { 
  Menu, ChevronDown, Home, LayoutDashboard, FileText, Calendar, Plus, 
  Sparkles, Activity, Heart, Shield, Download, CreditCard, Settings, 
  TrendingUp, Target, Bell, User 
} from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';

interface Props {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  setShowSymptomChecker: (show: boolean) => void;
  setShowHealthTips: (show: boolean) => void;
  setShowEmergencyContacts: (show: boolean) => void;
  setShowHealthGoals: (show: boolean) => void;
  setShowVoiceCustomization: (show: boolean) => void;
  setShowProgressDashboard: (show: boolean) => void;
  setShowDataExport: (show: boolean) => void;
  setShowTwoFactorAuth: (show: boolean) => void;
  setShowAppointmentsList: (show: boolean) => void;
  onNewConsultation: () => void;
  onUpgrade: () => void;
  onOpenReminders?: () => void;
  userName: string;
}

export default function Header({
  currentPage,
  setCurrentPage,
  setShowSymptomChecker,
  setShowHealthTips,
  setShowEmergencyContacts,
  setShowHealthGoals,
  setShowVoiceCustomization,
  setShowProgressDashboard,
  setShowDataExport,
  setShowTwoFactorAuth,
  setShowAppointmentsList,
  onNewConsultation,
  onUpgrade,
  onOpenReminders,
  userName
}: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const essentialButtons = [
    { icon: <Home size={18} />, label: 'Home', onClick: () => setCurrentPage('home'), active: currentPage === 'home' },
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', onClick: () => setCurrentPage('dashboard'), active: currentPage === 'dashboard' },
    { icon: <FileText size={18} />, label: 'Reports', onClick: () => setCurrentPage('reports'), active: currentPage === 'reports' },
    { icon: <Calendar size={18} />, label: 'Appointments', onClick: () => setShowAppointmentsList(true), active: false },
  ];

  const dropdownItems = [
    { icon: <Activity size={18} />, label: 'Symptom Checker', onClick: () => setShowSymptomChecker(true) },
    { icon: <Heart size={18} />, label: 'Health Tips', onClick: () => setShowHealthTips(true) },
    { icon: <Shield size={18} />, label: 'Emergency Contacts', onClick: () => setShowEmergencyContacts(true) },
    { icon: <Target size={18} />, label: 'Health Goals', onClick: () => setShowHealthGoals(true) },
    { icon: <Settings size={18} />, label: 'Voice Settings', onClick: () => setShowVoiceCustomization(true) },
    { icon: <TrendingUp size={18} />, label: 'Progress Dashboard', onClick: () => setShowProgressDashboard(true) },
    { icon: <Download size={18} />, label: 'Export Data', onClick: () => setShowDataExport(true) },
    { icon: <Shield size={18} />, label: '2FA Settings', onClick: () => setShowTwoFactorAuth(true) },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.navContent}>
        {/* ===== UPDATED LOGO SECTION ===== */}
        <div onClick={() => setCurrentPage('home')} style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Medical cross */}
              <rect x="6" y="6" width="16" height="16" rx="4" stroke="white" strokeWidth="2.5" fill="none"/>
              <path d="M14 9V17" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M10 13H18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              {/* Voice wave dots - representing voice/AI */}
              <circle cx="22" cy="8" r="1.8" fill="white" opacity="0.9"/>
              <circle cx="24.5" cy="11" r="1.4" fill="white" opacity="0.7"/>
              <circle cx="26" cy="14" r="1" fill="white" opacity="0.5"/>
              <circle cx="22" cy="20" r="1.8" fill="white" opacity="0.9"/>
              <circle cx="24.5" cy="17" r="1.4" fill="white" opacity="0.7"/>
            </svg>
          </div>
          <h1 style={styles.logo}>MediVoice AI</h1>
        </div>

        <div style={styles.navLinks}>
          {essentialButtons.map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.onClick}
              style={{
                ...styles.navButton,
                ...(btn.active ? styles.navButtonActive : {}),
              }}
            >
              {btn.icon}
              <span>{btn.label}</span>
            </button>
          ))}

          {/* Reminders Button */}
          <button onClick={onOpenReminders} style={styles.reminderButton}>
            <Bell size={18} />
            <span>Reminders</span>
          </button>

          <button onClick={onUpgrade} style={styles.upgradeButton}>
            <CreditCard size={18} />
            <span>Upgrade</span>
          </button>

          <button onClick={onNewConsultation} style={styles.consultButton}>
            <Plus size={18} />
            <span>New Consultation</span>
          </button>

          <div ref={dropdownRef} style={styles.dropdownContainer}>
            <button onClick={toggleDropdown} style={styles.dropdownButton}>
              <Menu size={18} />
              <span>More</span>
              <ChevronDown size={14} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {isDropdownOpen && (
              <div style={styles.dropdownMenu}>
                {dropdownItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      item.onClick();
                      setIsDropdownOpen(false);
                    }}
                    style={styles.dropdownItem}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <ProfileDropdown onOpen2FA={() => setShowTwoFactorAuth(true)} />
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: 'var(--bg-nav)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    padding: '0.5rem 0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    position: 'sticky' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderBottom: '1px solid var(--border-color)',
  },
  navContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '6px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  // ===== UPDATED LOGO ICON =====
  logoIcon: {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
  },
  // ===== UPDATED LOGO TEXT =====
  logo: {
    fontSize: '1.25rem',
    fontWeight: 700,
    margin: 0,
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
  },
  navLinks: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    justifyContent: 'flex-end',
    maxWidth: '70%',
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    fontSize: '0.75rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  navButtonActive: {
    background: 'var(--badge-bg)',
    color: 'var(--button-primary)',
  },
  reminderButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    background: 'transparent',
    border: '1px solid #8b5cf6',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#8b5cf6',
    fontSize: '0.75rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  upgradeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 14px',
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    boxShadow: '0 0 8px rgba(245, 158, 11, 0.3)',
  },
  consultButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 14px',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    boxShadow: '0 0 8px rgba(59, 130, 246, 0.3)',
  },
  dropdownContainer: {
    position: 'relative' as const,
  },
  dropdownButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    fontSize: '0.75rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  dropdownMenu: {
    position: 'absolute' as const,
    top: 'calc(100% + 8px)',
    right: 0,
    width: '210px',
    background: 'var(--bg-card)',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
    border: '1px solid var(--border-color)',
    zIndex: 1000,
    overflow: 'hidden',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px 14px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    color: 'var(--text-primary)',
    textAlign: 'left' as const,
    transition: 'all 0.15s ease',
  },
};

// Add hover styles via a style tag
const hoverStyles = document.createElement('style');
hoverStyles.textContent = `
  /* Nav button hover */
  .nav-button:hover {
    background: var(--badge-bg);
    color: var(--text-primary);
  }
  
  /* Reminder button hover */
  .reminder-button:hover {
    background: rgba(139, 92, 246, 0.1);
    transform: translateY(-1px);
  }
  
  /* Upgrade button hover */
  .upgrade-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
  }
  
  /* Consult button hover */
  .consult-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
  
  /* Dropdown item hover */
  .dropdown-item:hover {
    background: var(--badge-bg);
  }
  
  /* Dropdown button hover */
  .dropdown-button:hover {
    background: var(--badge-bg);
    border-color: var(--text-secondary);
  }
`;
document.head.appendChild(hoverStyles);