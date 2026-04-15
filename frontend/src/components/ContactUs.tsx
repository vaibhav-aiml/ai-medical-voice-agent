import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Facebook, Twitter, Linkedin, Github } from 'lucide-react';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 3000);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    { icon: <Mail size={20} />, label: 'Email', value: 'support@medivoice.ai', link: 'mailto:support@medivoice.ai' },
    { icon: <Phone size={20} />, label: 'Phone', value: '+1 (555) 123-4567', link: 'tel:+15551234567' },
    { icon: <MapPin size={20} />, label: 'Address', value: '123 Healthcare Ave, Medical District, NY 10001', link: null },
    { icon: <Clock size={20} />, label: 'Support Hours', value: '24/7 - Always Available', link: null },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.badge}>Get in Touch</div>
        <h1 style={styles.title}>Contact <span style={styles.accent}>Us</span></h1>
        <p style={styles.subtitle}>
          Have questions? We're here to help. Reach out to us anytime.
        </p>
      </div>

      <div style={styles.content}>
        <div style={styles.contactInfoSection}>
          <h2 style={styles.sectionTitle}>Contact Information</h2>
          <div style={styles.infoGrid}>
            {contactInfo.map((info, index) => (
              <div key={index} style={styles.infoCard}>
                <div style={styles.infoIcon}>{info.icon}</div>
                <div>
                  <div style={styles.infoLabel}>{info.label}</div>
                  {info.link ? (
                    <a href={info.link} style={styles.infoValueLink}>{info.value}</a>
                  ) : (
                    <div style={styles.infoValue}>{info.value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.socialSection}>
            <h3 style={styles.socialTitle}>Follow Us</h3>
            <div style={styles.socialLinks}>
              <a href="#" style={styles.socialLink}><Facebook size={20} /></a>
              <a href="#" style={styles.socialLink}><Twitter size={20} /></a>
              <a href="#" style={styles.socialLink}><Linkedin size={20} /></a>
              <a href="#" style={styles.socialLink}><Github size={20} /></a>
            </div>
          </div>
        </div>

        <div style={styles.formSection}>
          <h2 style={styles.sectionTitle}>Send us a Message</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="John Doe"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Subject *</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="How can we help you?"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                style={styles.textarea}
                rows={5}
                placeholder="Please describe your question or concern..."
              />
            </div>
            <button type="submit" style={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
              <Send size={16} />
            </button>
            {submitted && (
              <div style={styles.successMessage}>
                ✅ Message sent successfully! We'll get back to you soon.
              </div>
            )}
          </form>
        </div>
      </div>

      <div style={styles.faqSection}>
        <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
        <div style={styles.faqGrid}>
          <div style={styles.faqItem}>
            <h4>Is MediVoice AI free to use?</h4>
            <p>Yes! We offer free consultations with basic features. Premium plans are available for advanced features.</p>
          </div>
          <div style={styles.faqItem}>
            <h4>Are the AI doctors qualified?</h4>
            <p>Our AI is trained on medical data from qualified professionals. However, always consult a real doctor for serious conditions.</p>
          </div>
          <div style={styles.faqItem}>
            <h4>Is my data secure?</h4>
            <p>Absolutely. We use enterprise-grade encryption to protect your medical information.</p>
          </div>
          <div style={styles.faqItem}>
            <h4>Can I download my reports?</h4>
            <p>Yes! All consultation reports can be downloaded as PDF files.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  hero: {
    textAlign: 'center' as const,
    marginBottom: '60px',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 16px',
    background: '#eff6ff',
    color: '#3b82f6',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '20px',
  },
  title: {
    fontSize: '48px',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '20px',
  },
  accent: {
    color: '#3b82f6',
  },
  subtitle: {
    fontSize: '18px',
    color: '#64748b',
    maxWidth: '600px',
    margin: '0 auto',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '40px',
    marginBottom: '60px',
  },
  contactInfoSection: {
    background: 'white',
    borderRadius: '20px',
    padding: '32px',
    border: '1px solid #e5e7eb',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '24px',
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    marginBottom: '32px',
  },
  infoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px',
  },
  infoIcon: {
    width: '40px',
    height: '40px',
    background: '#eff6ff',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#3b82f6',
  },
  infoLabel: {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '4px',
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1e293b',
  },
  infoValueLink: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#3b82f6',
    textDecoration: 'none',
  },
  socialSection: {
    textAlign: 'center' as const,
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb',
  },
  socialTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '16px',
  },
  socialLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
  },
  socialLink: {
    width: '40px',
    height: '40px',
    background: '#f1f5f9',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  formSection: {
    background: 'white',
    borderRadius: '20px',
    padding: '32px',
    border: '1px solid #e5e7eb',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1e293b',
  },
  input: {
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  textarea: {
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  successMessage: {
    padding: '12px',
    background: '#ecfdf5',
    color: '#10b981',
    borderRadius: '10px',
    textAlign: 'center' as const,
    fontSize: '14px',
  },
  faqSection: {
    marginTop: '40px',
  },
  faqGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px',
    marginTop: '32px',
  },
  faqItem: {
    padding: '20px',
    background: 'white',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
  },
};

// Add hover styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  input:focus, textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .social-link:hover {
    background: #3b82f6;
    color: white;
    transform: translateY(-2px);
  }
  
  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -12px rgba(0,0,0,0.1);
  }
`;
document.head.appendChild(styleSheet);