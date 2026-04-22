import { Heart, Phone, Mail, MapPin, Globe } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '#' },
    { name: 'Dashboard', href: '#' },
    { name: 'Reports', href: '#' },
    { name: 'Appointments', href: '#' },
    { name: 'Symptom Checker', href: '#' },
    { name: 'Health Tips', href: '#' },
  ];

  const services = [
    { name: 'Voice Consultation', href: '#' },
    { name: 'AI Specialists', href: '#' },
    { name: 'Medical Reports', href: '#' },
    { name: 'Appointment Booking', href: '#' },
    { name: 'Emergency Contacts', href: '#' },
    { name: 'Health Goals', href: '#' },
  ];

  const legal = [
    { name: 'About Us', href: '#' },
    { name: 'Contact Us', href: '#' },
    { name: 'Terms & Conditions', href: '#' },
    { name: 'Privacy Policy', href: '#' },
    { name: 'HIPAA Compliance', href: '#' },
    { name: 'Cookie Policy', href: '#' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: '📘', color: '#1877f2', href: '#' },
    { name: 'Twitter', icon: '🐦', color: '#1da1f2', href: '#' },
    { name: 'LinkedIn', icon: '🔗', color: '#0a66c2', href: '#' },
    { name: 'GitHub', icon: '🐙', color: '#333', href: 'https://github.com/vaibhav-aiml/ai-medical-voice-agent' },
    { name: 'Instagram', icon: '📸', color: '#e4405f', href: '#' },
    { name: 'YouTube', icon: '📺', color: '#ff0000', href: '#' },
  ];

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Main Footer Content */}
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
                <span>+1 (888) 123-4567</span>
              </div>
              <div style={styles.contactItem}>
                <Mail size={16} />
                <span>support@medivoice.ai</span>
              </div>
              <div style={styles.contactItem}>
                <MapPin size={16} />
                <span>Healthcare District, NY 10001, USA</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div style={styles.linksColumn}>
            <h3>Quick Links</h3>
            <ul style={styles.linkList}>
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} style={styles.link}>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div style={styles.linksColumn}>
            <h3>Our Services</h3>
            <ul style={styles.linkList}>
              {services.map((service, index) => (
                <li key={index}>
                  <a href={service.href} style={styles.link}>
                    {service.name}
                  </a>
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
                  <a href={item.href} style={styles.link}>
                    {item.name}
                  </a>
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
            {socialLinks.map((social, index) => (
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
  link: {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '13px',
    transition: 'color 0.2s ease',
    cursor: 'pointer',
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
    width: '40px',
    height: '40px',
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