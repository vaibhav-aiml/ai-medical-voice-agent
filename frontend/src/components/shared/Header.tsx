import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { 
  Menu, ChevronDown, Home, LayoutDashboard, FileText, Calendar, Plus, 
  Sparkles, Activity, Heart, Shield, Download, CreditCard, Settings, 
  TrendingUp, Target, Bell, User, Mic, Database, X
} from 'lucide-react';
import ProfileDropdown from '../profile/ProfileDropdown';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useUser } from '@clerk/clerk-react';
import apiClient from '../../services/apiClient';

interface HeaderMedication {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  times?: string[];
  daysOfWeek?: number[];
  active?: boolean;
}

interface Props {
  setShowSymptomChecker: (show: boolean) => void;
  setShowHealthTips: (show: boolean) => void;
  setShowEmergencyContacts: (show: boolean) => void;
  setShowHealthGoals: (show: boolean) => void;
  setShowVoiceCustomization: (show: boolean) => void;
  setShowProgressDashboard: (show: boolean) => void;
  setShowDataExport: (show: boolean) => void;
  setShowTwoFactorAuth: (show: boolean) => void;
  setShowAppointmentsList: (show: boolean) => void;
  setShowVoiceBiometricsEnrollment: (show: boolean) => void;
  setShowFHIRConnector: (show: boolean) => void;
  onNewConsultation: () => void;
  onUpgrade: () => void;
  onOpenReminders?: () => void;
  userName: string;
}

export default function Header({
  setShowSymptomChecker,
  setShowHealthTips,
  setShowEmergencyContacts,
  setShowHealthGoals,
  setShowVoiceCustomization,
  setShowProgressDashboard,
  setShowDataExport,
  setShowTwoFactorAuth,
  setShowAppointmentsList,
  setShowVoiceBiometricsEnrollment,
  setShowFHIRConnector,
  onNewConsultation,
  onUpgrade,
  onOpenReminders,
  userName
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet } = useBreakpoint();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [medications, setMedications] = useState<HeaderMedication[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const remindersRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const { user } = useUser();
  const showMobileNav = isMobile || isTablet;

  // Fetch medications on mount to power the reminder badge count and popover preview
  useEffect(() => {
    let isMounted = true;
    const fetchMedications = async () => {
      try {
        const uId = user?.id || 'demo-user-default';
        const response = await apiClient.get(`/reminder/medications/${uId}`);
        if (isMounted && response.data?.success && Array.isArray(response.data?.data)) {
          setMedications(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching reminders for header badge:', error);
      }
    };

    fetchMedications();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (remindersRef.current && !remindersRef.current.contains(event.target as Node)) {
        setIsRemindersOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close menus on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDropdownOpen) setIsDropdownOpen(false);
        if (isRemindersOpen) setIsRemindersOpen(false);
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
          hamburgerRef.current?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, isDropdownOpen, isRemindersOpen]);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleMobileNavClick = useCallback((action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  }, []);

  const essentialButtons = [
    { icon: <Home size={18} />, label: 'Home', onClick: () => navigate('/'), active: location.pathname === '/' },
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', onClick: () => navigate('/dashboard'), active: location.pathname === '/dashboard' },
    { icon: <FileText size={18} />, label: 'Reports', onClick: () => navigate('/reports'), active: location.pathname === '/reports' },
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
    { icon: <Mic size={18} />, label: 'Voice Biometrics', onClick: () => setShowVoiceBiometricsEnrollment(true) },
    { icon: <Database size={18} />, label: 'EHR Connection', onClick: () => setShowFHIRConnector(true) },
  ];

  const allMobileItems = [
    ...essentialButtons.map(b => ({ icon: b.icon, label: b.label, onClick: b.onClick })),
    { icon: <Bell size={18} />, label: 'Reminders', onClick: () => onOpenReminders?.() },
    { icon: <CreditCard size={18} />, label: 'Upgrade', onClick: onUpgrade },
    { icon: <Plus size={18} />, label: 'New Consultation', onClick: onNewConsultation },
    ...dropdownItems,
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.navContent}>
        {}
        <div onClick={() => navigate('/')} style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              {}
              <rect x="6" y="6" width="16" height="16" rx="4" stroke="white" strokeWidth="2.5" fill="none"/>
              <path d="M14 9V17" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M10 13H18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              {}
              <circle cx="22" cy="8" r="1.8" fill="white" opacity="0.9"/>
              <circle cx="24.5" cy="11" r="1.4" fill="white" opacity="0.7"/>
              <circle cx="26" cy="14" r="1" fill="white" opacity="0.5"/>
              <circle cx="22" cy="20" r="1.8" fill="white" opacity="0.9"/>
              <circle cx="24.5" cy="17" r="1.4" fill="white" opacity="0.7"/>
            </svg>
          </div>
          <h1 style={styles.logo}>MediVoice AI</h1>
        </div>

        {showMobileNav ? (
          /* ── Mobile / Tablet: hamburger + slide-down menu ── */
          <div style={styles.mobileNavContainer}>
            <ProfileDropdown onOpen2FA={() => setShowTwoFactorAuth(true)} />
            <button
              ref={hamburgerRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={styles.hamburgerButton}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        ) : (
          /* ── Desktop: original navigation ── */
          <div style={styles.navLinks}>
            {essentialButtons.map((btn, idx) => (
              <button
                key={idx}
                className="nav-button"
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

            {/* Circular Reminders Bell with Count Badge & Popover Preview */}
            <div ref={remindersRef} style={styles.remindersContainer}>
              <button
                onClick={() => setIsRemindersOpen(prev => !prev)}
                className="reminder-bell-button"
                style={styles.reminderBellButton}
                aria-label={
                  medications.length > 0
                    ? `Reminders (${medications.length} active)`
                    : 'Reminders'
                }
                aria-expanded={isRemindersOpen}
                type="button"
              >
                <Bell size={18} />
                {medications.length > 0 && (
                  <span style={styles.reminderBadge}>
                    {medications.length}
                  </span>
                )}
              </button>

              {isRemindersOpen && (
                <div style={styles.remindersPopover}>
                  <div style={styles.remindersPopoverHeader}>
                    <span style={styles.remindersPopoverTitle}>Medication Reminders</span>
                    {medications.length > 0 && (
                      <span style={styles.remindersCountTag}>
                        {medications.length} active
                      </span>
                    )}
                  </div>

                  <div style={styles.remindersList}>
                    {medications.length === 0 ? (
                      <div style={styles.remindersEmpty}>
                        No active reminders
                      </div>
                    ) : (
                      medications.slice(0, 3).map((med, idx) => (
                        <div key={med.id || idx} style={styles.reminderItem}>
                          <div style={styles.reminderItemHeader}>
                            <span style={styles.reminderMedName}>{med.name}</span>
                            {med.dosage && (
                              <span style={styles.reminderDosage}>{med.dosage}</span>
                            )}
                          </div>
                          <div style={styles.reminderItemMeta}>
                            {med.times && med.times.length > 0 && (
                              <span>
                                🕒 {med.times.join(', ')}
                              </span>
                            )}
                            {med.frequency && (
                              <span>
                                • {med.frequency.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={styles.remindersPopoverFooter}>
                    <button
                      onClick={() => {
                        setIsRemindersOpen(false);
                        if (onOpenReminders) {
                          onOpenReminders();
                        } else {
                          navigate('/reminders');
                        }
                      }}
                      style={styles.viewAllRemindersButton}
                      type="button"
                    >
                      View all reminders →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={onUpgrade} className="upgrade-button" style={styles.upgradeButton}>
              <CreditCard size={18} />
              <span>Upgrade</span>
            </button>

            <button onClick={onNewConsultation} className="consult-button" style={styles.consultButton}>
              <Plus size={18} />
              <span>New Consultation</span>
            </button>

            <div ref={dropdownRef} style={styles.dropdownContainer}>
              <button onClick={toggleDropdown} className="dropdown-button" style={styles.dropdownButton}>
                <Menu size={18} />
                <span>More</span>
                <ChevronDown size={14} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {isDropdownOpen && (
                <div style={styles.dropdownMenu}>
                  {dropdownItems.map((item, idx) => (
                    <button
                      key={idx}
                      className="dropdown-item"
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
        )}
      </div>

      {/* ── Mobile slide-down menu ── */}
      {showMobileNav && (
        <div
          ref={mobileMenuRef}
          style={{
            ...styles.mobileMenu,
            maxHeight: isMobileMenuOpen ? '80vh' : '0',
            opacity: isMobileMenuOpen ? 1 : 0,
            padding: isMobileMenuOpen ? '8px 0' : '0',
            borderTop: isMobileMenuOpen ? '1px solid var(--border-color)' : 'none',
          }}
          role="navigation"
          aria-label="Mobile navigation"
        >
          {allMobileItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleMobileNavClick(item.onClick)}
              style={styles.mobileMenuItem}
              tabIndex={isMobileMenuOpen ? 0 : -1}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
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
    flexWrap: 'nowrap' as const,
    gap: '6px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    flexShrink: 0,
  },
  
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
  
  logo: {
    fontSize: '1.25rem',
    fontWeight: 700,
    margin: 0,
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
    whiteSpace: 'nowrap' as const,
  },
  navLinks: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    flexWrap: 'nowrap' as const,
    justifyContent: 'flex-end',
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
  remindersContainer: {
    position: 'relative' as const,
  },
  reminderBellButton: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    color: '#8b5cf6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    transition: 'background 0.2s ease, border-color 0.2s ease',
    padding: 0,
    flexShrink: 0,
  },
  reminderBadge: {
    position: 'absolute' as const,
    top: '-3px',
    right: '-3px',
    minWidth: '18px',
    height: '18px',
    padding: '0 4px',
    borderRadius: '9999px',
    background: '#ef4444',
    color: 'white',
    fontSize: '10px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    lineHeight: 1,
    pointerEvents: 'none' as const,
  },
  remindersPopover: {
    position: 'absolute' as const,
    top: 'calc(100% + 8px)',
    right: 0,
    width: '280px',
    background: 'var(--bg-card)',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
    border: '1px solid var(--border-color)',
    zIndex: 1000,
    overflow: 'hidden',
  },
  remindersPopoverHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderBottom: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
  },
  remindersPopoverTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  remindersCountTag: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '9999px',
    background: 'rgba(139, 92, 246, 0.12)',
    color: '#8b5cf6',
  },
  remindersList: {
    maxHeight: '220px',
    overflowY: 'auto' as const,
    padding: '4px 0',
  },
  reminderItem: {
    padding: '10px 14px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  reminderItemHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  reminderMedName: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  reminderDosage: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  reminderItemMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: 'var(--text-muted)',
    flexWrap: 'wrap' as const,
  },
  remindersEmpty: {
    padding: '24px 16px',
    textAlign: 'center' as const,
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  remindersPopoverFooter: {
    padding: '8px 12px',
    borderTop: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
  },
  viewAllRemindersButton: {
    width: '100%',
    padding: '8px 12px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
    color: '#8b5cf6',
    textAlign: 'center' as const,
    transition: 'background 0.15s ease',
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
  /* ── Mobile-specific styles ── */
  mobileNavContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  hamburgerButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    transition: 'all 0.2s ease',
  },
  mobileMenu: {
    overflow: 'hidden' as const,
    transition: 'max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease',
    background: 'var(--bg-nav)',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  mobileMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 24px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    textAlign: 'left' as const,
    transition: 'background 0.15s ease',
  },
};
const hoverStyles = document.createElement('style');
hoverStyles.textContent = `
  /* Nav button hover */
  .nav-button:hover {
    background: var(--badge-bg);
    color: var(--text-primary);
    transform: translateY(-1px);
  }
  
  /* Reminder bell hover - distinct subtle background fill, NO translateY lift */
  .reminder-bell-button:hover {
    background: rgba(139, 92, 246, 0.1) !important;
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
    transform: translateY(-1px);
  }
`;
document.head.appendChild(hoverStyles);