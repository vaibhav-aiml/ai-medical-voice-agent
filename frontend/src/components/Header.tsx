import { useState, useRef, useEffect } from 'react';
import { 
  Menu, ChevronDown, Home, LayoutDashboard, FileText, Calendar, Plus, 
  Sparkles, Activity, Heart, Shield, Download, CreditCard, Settings, 
  TrendingUp, Target
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Essential features (always visible on desktop)
  const essentialButtons = [
    { icon: <Home size={18} />, label: 'Home', onClick: () => setCurrentPage('home'), active: currentPage === 'home' },
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', onClick: () => setCurrentPage('dashboard'), active: currentPage === 'dashboard' },
    { icon: <FileText size={18} />, label: 'Reports', onClick: () => setCurrentPage('reports'), active: currentPage === 'reports' },
    { icon: <Calendar size={18} />, label: 'Appointments', onClick: () => setShowAppointmentsList(true), active: false },
  ];

  // Dropdown menu items
  const dropdownItems = [
    { icon: <Activity size={18} />, label: 'Symptom Checker', onClick: () => setShowSymptomChecker(true) },
    { icon: <Heart size={18} />, label: 'Health Tips', onClick: () => setShowHealthTips(true) },
    { icon: <Shield size={18} />, label: 'Emergency', onClick: () => setShowEmergencyContacts(true) },
    { icon: <Target size={18} />, label: 'Health Goals', onClick: () => setShowHealthGoals(true) },
    { icon: <Settings size={18} />, label: 'Voice Settings', onClick: () => setShowVoiceCustomization(true) },
    { icon: <TrendingUp size={18} />, label: 'Progress', onClick: () => setShowProgressDashboard(true) },
    { icon: <Download size={18} />, label: 'Export Data', onClick: () => setShowDataExport(true) },
    { icon: <Shield size={18} />, label: '2FA', onClick: () => setShowTwoFactorAuth(true) },
  ];

  // Mobile menu items (all features without active property)
  const mobileMenuItems = [
    { icon: <Home size={18} />, label: 'Home', onClick: () => setCurrentPage('home') },
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', onClick: () => setCurrentPage('dashboard') },
    { icon: <FileText size={18} />, label: 'Reports', onClick: () => setCurrentPage('reports') },
    { icon: <Calendar size={18} />, label: 'Appointments', onClick: () => setShowAppointmentsList(true) },
    { icon: <Activity size={18} />, label: 'Symptom Checker', onClick: () => setShowSymptomChecker(true) },
    { icon: <Heart size={18} />, label: 'Health Tips', onClick: () => setShowHealthTips(true) },
    { icon: <Shield size={18} />, label: 'Emergency', onClick: () => setShowEmergencyContacts(true) },
    { icon: <Target size={18} />, label: 'Health Goals', onClick: () => setShowHealthGoals(true) },
    { icon: <Settings size={18} />, label: 'Voice Settings', onClick: () => setShowVoiceCustomization(true) },
    { icon: <TrendingUp size={18} />, label: 'Progress', onClick: () => setShowProgressDashboard(true) },
    { icon: <Download size={18} />, label: 'Export Data', onClick: () => setShowDataExport(true) },
    { icon: <Shield size={18} />, label: '2FA', onClick: () => setShowTwoFactorAuth(true) },
    { icon: <CreditCard size={18} />, label: 'Upgrade', onClick: onUpgrade },
    { icon: <Plus size={18} />, label: 'New Consultation', onClick: onNewConsultation },
  ];

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          {/* Logo */}
          <div onClick={() => setCurrentPage('home')} style={styles.logoContainer}>
            <div style={styles.logoIcon}>
              <Sparkles size={20} />
            </div>
            <h1 style={styles.logo}>MediVoice AI</h1>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <div style={styles.desktopNav}>
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
                <CreditCard size={16} />
                <span>Upgrade</span>
              </button>

              <button onClick={onNewConsultation} style={styles.consultButton}>
                <Plus size={16} />
                <span>New Consultation</span>
              </button>

              {/* More Dropdown */}
              <div ref={dropdownRef} style={styles.dropdownContainer}>
                <button onClick={toggleDropdown} style={styles.dropdownButton}>
                  <Menu size={16} />
                  <span>More</span>
                  <ChevronDown size={12} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
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

          {/* Mobile Menu Button - Visible only on mobile */}
          <button onClick={toggleMobileMenu} style={styles.mobileMenuButton}>
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div style={styles.mobileMenuOverlay} onClick={() => setIsMobileMenuOpen(false)}>
          <div style={styles.mobileMenuDrawer} ref={mobileMenuRef} onClick={(e) => e.stopPropagation()}>
            <div style={styles.mobileMenuHeader}>
              <div style={styles.mobileMenuLogo}>
                <Sparkles size={20} />
                <span>MediVoice AI</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} style={styles.mobileMenuClose}>✕</button>
            </div>
            <div style={styles.mobileMenuItems}>
              {mobileMenuItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    item.onClick();
                    setIsMobileMenuOpen(false);
                  }}
                  style={styles.mobileMenuItem}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            <div style={styles.mobileMenuFooter}>
              <ProfileDropdown onOpen2FA={() => setShowTwoFactorAuth(true)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  nav: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '12px 16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderBottom: '1px solid var(--border-color)',
  },
  navContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  logo: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  desktopNav: {
    display: 'flex',
  },
  navLinks: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  navButtonActive: {
    background: 'rgba(59, 130, 246, 0.1)',
    color: '#3b82f6',
  },
  upgradeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  consultButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdownButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '220px',
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
    gap: '12px',
    width: '100%',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'var(--text-primary)',
    textAlign: 'left',
    transition: 'background 0.2s ease',
  },
  mobileMenuButton: {
    display: 'none',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    padding: '8px',
    borderRadius: '8px',
  },
  mobileMenuOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 1001,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  mobileMenuDrawer: {
    width: '280px',
    height: '100%',
    background: 'var(--bg-card)',
    boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  mobileMenuHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid var(--border-color)',
  },
  mobileMenuLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  mobileMenuClose: {
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  mobileMenuItems: {
    flex: 1,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    overflowY: 'auto',
  },
  mobileMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15px',
    color: 'var(--text-primary)',
    textAlign: 'left',
    transition: 'background 0.2s ease',
  },
  mobileMenuFooter: {
    padding: '16px',
    borderTop: '1px solid var(--border-color)',
  },
};

// Add animation and responsive styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
  
  .mobile-menu-drawer {
    animation: slideIn 0.3s ease;
  }
  
  @media (max-width: 768px) {
    .desktop-nav {
      display: none !important;
    }
    
    .mobile-menu-button {
      display: flex !important;
    }
  }
  
  @media (min-width: 769px) {
    .mobile-menu-button {
      display: none !important;
    }
    
    .mobile-menu-overlay {
      display: none !important;
    }
  }
`;
document.head.appendChild(styleSheet);