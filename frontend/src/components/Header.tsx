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
        <div onClick={() => setCurrentPage('home')} style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <Sparkles size={22} />
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
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    padding: '0.5rem 0',
    boxShadow: 'none',
    position: 'sticky' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderBottom: 'none',
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
  logoIcon: {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, var(--button-primary), #2563eb)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
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
    padding: '4px 10px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    fontSize: '0.75rem',
    fontWeight: 500,
    transition: 'all 0.3s ease',
  },
  navButtonActive: {
    background: 'var(--badge-bg)',
    color: 'var(--button-primary)',
  },
  upgradeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    boxShadow: '0 0 8px rgba(245, 158, 11, 0.4)',
  },
  consultButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 500,
    transition: 'all 0.3s ease',
    boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)',
  },
  dropdownContainer: {
    position: 'relative' as const,
  },
  dropdownButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
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
    transition: 'background 0.2s ease',
  },
};