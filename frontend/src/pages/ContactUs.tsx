import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { useState } from 'react';
import BackButton from '../components/BackButton';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div style={styles.container}>
      {/* Back Button */}
      <BackButton />

      <div style={styles.hero}>
        <h1 style={styles.title}>Contact <span style={styles.accent}>Us</span></h1>
        <p style={styles.subtitle}>We're here to help. Reach out to us anytime.</p>
      </div>

      <div style={styles.content}>
        <div style={styles.infoSection}>
          <h2>Get in Touch</h2>
          <div style={styles.infoGrid}>
            <div style={styles.infoCard}>
              <Phone size={24} color="#3b82f6" />
              <h3>Phone</h3>
              <p>+91 98765 43210</p>
              <p>+91 98765 43211 (Emergency)</p>
            </div>
            <div style={styles.infoCard}>
              <Mail size={24} color="#3b82f6" />
              <h3>Email</h3>
              <p>support@medivoice.ai</p>
              <p>care@medivoice.ai</p>
            </div>
            <div style={styles.infoCard}>
              <MapPin size={24} color="#3b82f6" />
              <h3>Address</h3>
              <p>DLF Cyber City, Phase 3</p>
              <p>Gurugram, Haryana - 122002</p>
            </div>
            <div style={styles.infoCard}>
              <Clock size={24} color="#3b82f6" />
              <h3>Support Hours</h3>
              <p>Monday - Friday: 9 AM - 9 PM</p>
              <p>Weekends: 10 AM - 6 PM</p>
            </div>
          </div>
        </div>

        <div style={styles.formSection}>
          <h2>Send us a Message</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <input
                type="text"
                placeholder="Your Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={styles.input}
              />
              <input
                type="email"
                placeholder="Your Email *"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={styles.input}
              />
            </div>
            <input
              type="text"
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              style={styles.input}
            />
            <textarea
              placeholder="Your Message *"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={5}
              style={styles.textarea}
            />
            <button type="submit" style={styles.button}>
              <Send size={16} /> Send Message
            </button>
            {submitted && <div style={styles.success}>✓ Message sent successfully!</div>}
          </form>
        </div>
      </div>

      <div style={styles.mapSection}>
        <h2>Visit Us</h2>
        <div style={styles.mapPlaceholder}>
          <p>📍 DLF Cyber City, Gurugram, Haryana</p>
          <p>Located in the heart of India's tech hub</p>
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
    position: 'relative' as const,
  },
  hero: {
    textAlign: 'center' as const,
    marginBottom: '48px',
  },
  title: {
    fontSize: '48px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '16px',
  },
  accent: {
    color: '#3b82f6',
  },
  subtitle: {
    fontSize: '18px',
    color: 'var(--text-secondary)',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '48px',
    marginBottom: '48px',
  },
  infoSection: {},
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginTop: '20px',
  },
  infoCard: {
    padding: '24px',
    background: 'var(--bg-card)',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
    textAlign: 'center' as const,
  },
  formSection: {},
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    marginTop: '20px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  input: {
    padding: '12px 16px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '14px',
  },
  textarea: {
    padding: '12px 16px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  success: {
    padding: '12px',
    background: '#10b981',
    color: 'white',
    borderRadius: '8px',
    textAlign: 'center' as const,
  },
  mapSection: {
    padding: '32px',
    background: 'var(--bg-card)',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
    textAlign: 'center' as const,
  },
  mapPlaceholder: {
    marginTop: '20px',
    padding: '60px',
    background: 'var(--badge-bg)',
    borderRadius: '12px',
  },
};