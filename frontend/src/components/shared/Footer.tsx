import { Heart, Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string) => void;
  onOpenModal?: (modal: string) => void;
  setCurrentPage?: (page: string) => void;
  setShowSymptomChecker?: (show: boolean) => void;
  setShowHealthTips?: (show: boolean) => void;
  setShowEmergencyContacts?: (show: boolean) => void;
  setShowHealthGoals?: (show: boolean) => void;
  setShowAppointmentsList?: (show: boolean) => void;
}

export default function Footer({ 
  onNavigate, 
  setCurrentPage, 
  setShowSymptomChecker, 
  setShowHealthTips, 
  setShowEmergencyContacts, 
  setShowHealthGoals,
  setShowAppointmentsList 
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleNavigation = (page: string) => {
    if (setCurrentPage) {
      setCurrentPage(page);
    }
    window.scrollTo(0, 0);
  };

  const handleServiceClick = (service: string) => {
    if (service === 'Voice Consultation') handleNavigation('consultation');
    else if (service === 'AI Specialists') handleNavigation('consultation');
    else if (service === 'Medical Reports') handleNavigation('reports');
    else if (service === 'Appointment Booking' && setShowAppointmentsList) setShowAppointmentsList(true);
    else if (service === 'Emergency Contacts' && setShowEmergencyContacts) setShowEmergencyContacts(true);
    else if (service === 'Health Goals' && setShowHealthGoals) setShowHealthGoals(true);
  };

  const quickLinks = [
    { name: 'Home', onClick: () => handleNavigation('home') },
    { name: 'Dashboard', onClick: () => handleNavigation('dashboard') },
    { name: 'Reports', onClick: () => handleNavigation('reports') },
    { name: 'Appointments', onClick: () => setShowAppointmentsList && setShowAppointmentsList(true) },
    { name: 'Symptom Checker', onClick: () => setShowSymptomChecker && setShowSymptomChecker(true) },
    { name: 'Health Tips', onClick: () => setShowHealthTips && setShowHealthTips(true) },
  ];

  const services = [
    { name: 'Voice Consultation', onClick: () => handleServiceClick('Voice Consultation') },
    { name: 'AI Specialists', onClick: () => handleServiceClick('AI Specialists') },
    { name: 'Medical Reports', onClick: () => handleServiceClick('Medical Reports') },
    { name: 'Appointment Booking', onClick: () => handleServiceClick('Appointment Booking') },
    { name: 'Emergency Contacts', onClick: () => handleServiceClick('Emergency Contacts') },
    { name: 'Health Goals', onClick: () => handleServiceClick('Health Goals') },
  ];

  const legal = [
    { name: 'About Us', onClick: () => handleNavigation('about') },
    { name: 'Contact Us', onClick: () => handleNavigation('contact') },
    { name: 'Terms & Conditions', onClick: () => handleNavigation('terms') },
    { name: 'Privacy Policy', onClick: () => handleNavigation('privacy') },
    { name: 'HIPAA Compliance', onClick: () => handleNavigation('hipaa') },
    { name: 'Cookie Policy', onClick: () => handleNavigation('cookies') },
  ];

  const socialIcons = [
    { icon: '📘', name: 'Facebook', color: '#1877f2', href: '#' },
    { icon: '🐦', name: 'Twitter', color: '#1da1f2', href: '#' },
    { icon: '🔗', name: 'LinkedIn', color: '#0a66c2', href: '#' },
    { icon: '🐙', name: 'GitHub', color: '#333', href: 'https://github.com/vaibhav-aiml/ai-medical-voice-agent' },
    { icon: '📸', name: 'Instagram', color: '#e4405f', href: '#' },
  ];

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.mainContent}>
          {/* Brand Column */}
          <div style={styles.brandColumn}>
            <div style={styles.logo}>
              <Heart size={28} color="#3b82f6" />
              <h2>MediVoice AI</h2>
            </div>
            <p style={styles.brandDescription}>
              Your trusted AI-powered healthcare companion. Get instant medical advice, 
              schedule consultations, and manage your health records all in one place.
            </p>
            <div style={styles.contactInfo}>
              <div style={styles.contactItem}>
                <Phone size={16} />
                <span>+91 98765 43210</span>
              </div>
              <div style={styles.contactItem}>
                <Mail size={16} />
                <span>support@medivoice.ai</span>
              </div>
              <div style={styles.contactItem}>
                <MapPin size={16} />
                <span>DLF Cyber City, Gurugram, Haryana - 122002</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div style={styles.linksColumn}>
            <h3>Quick Links</h3>
            <ul style={styles.linkList}>
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button onClick={link.onClick} style={styles.linkButton}>
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Services */}
          <div style={styles.linksColumn}>
            <h3>Our Services</h3>
            <ul style={styles.linkList}>
              {services.map((service, index) => (
                <li key={index}>
                  <button onClick={service.onClick} style={styles.linkButton}>
                    {service.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div style={styles.linksColumn}>
            <h3>Legal</h3>
            <ul style={styles.linkList}>
              {legal.map((item, index) => (
                <li key={index}>
                  <button onClick={item.onClick} style={styles.linkButton}>
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div style={styles.newsletterSection}>
          <div style={styles.newsletterContent}>
            <h3>Subscribe to Our Newsletter</h3>
            <p>Get the latest health tips and updates directly in your inbox.</p>
            <div style={styles.newsletterForm}>
              <input
                type="email"
                placeholder="Enter your email"
                style={styles.newsletterInput}
              />
              <button style={styles.newsletterButton}>Subscribe</button>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div style={styles.socialSection}>
          <div style={styles.socialLinks}>
            {socialIcons.map((social, index) => (
              <a
                key={index}
                href={social.href}
                style={styles.socialLink}
                aria-label={social.name}
              >
                <span style={{ fontSize: '20px' }}>{social.icon}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div style={styles.copyright}>
          <p>&copy; {currentYear} MediVoice AI. All rights reserved.</p>
          <p style={styles.disclaimer}>
            <strong>Disclaimer:</strong> This is an AI-powered informational tool. 
            Always consult a qualified healthcare provider for medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-color)',
    marginTop: '60px',
    padding: '60px 0 20px',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 24px',
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: '40px',
    marginBottom: '48px',
  },
  brandColumn: {
    maxWidth: '300px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  brandDescription: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    marginBottom: '20px',
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  linksColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  linkList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  linkButton: {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '13px',
    transition: 'color 0.2s ease',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    textAlign: 'left' as const,
  },
  newsletterSection: {
    padding: '30px 0',
    borderTop: '1px solid var(--border-color)',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '30px',
  },
  newsletterContent: {
    textAlign: 'center' as const,
    maxWidth: '500px',
    margin: '0 auto',
  },
  newsletterForm: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
  },
  newsletterInput: {
    flex: 1,
    padding: '12px 16px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    outline: 'none',
  },
  newsletterButton: {
    padding: '12px 24px',
    background: 'var(--button-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  socialSection: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '30px',
  },
  socialLinks: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  },
  socialLink: {
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--badge-bg)',
    borderRadius: '50%',
    transition: 'transform 0.2s ease, background 0.2s ease',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  copyright: {
    textAlign: 'center' as const,
    paddingTop: '20px',
    borderTop: '1px solid var(--border-color)',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  disclaimer: {
    fontSize: '11px',
    marginTop: '8px',
    color: 'var(--text-muted)',
  },
};