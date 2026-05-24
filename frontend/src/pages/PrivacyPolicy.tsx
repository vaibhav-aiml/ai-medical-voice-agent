import BackButton from '../components/BackButton';

export default function PrivacyPolicy() {
  return (
    <div style={styles.container}>
      {/* Back Button */}
      <BackButton />

      <div style={styles.hero}>
        <h1 style={styles.title}>Privacy <span style={styles.accent}>Policy</span></h1>
      </div>

      <div style={styles.content}>
        <section style={styles.section}>
          <h2>Information We Collect</h2>
          <ul style={styles.list}>
            <li><strong>Personal Information:</strong> Name, email, phone number, age, gender</li>
            <li><strong>Health Information:</strong> Symptoms, medical history, consultation records</li>
            <li><strong>Usage Data:</strong> IP address, device information, browser type</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2>How We Use Your Information</h2>
          <ul style={styles.list}>
            <li>Provide AI-powered medical consultations</li>
            <li>Generate medical reports</li>
            <li>Improve our AI models</li>
            <li>Send important notifications and updates</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2>Data Storage & Security</h2>
          <p>Your data is stored securely using industry-standard encryption. We implement appropriate technical and organizational measures to protect your information.</p>
        </section>

        <section style={styles.section}>
          <h2>Data Sharing</h2>
          <p>We do not sell your personal information. We may share data with:</p>
          <ul style={styles.list}>
            <li>Healthcare providers (with your consent)</li>
            <li>Service providers who assist our operations</li>
            <li>Law enforcement when required by law</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2>Your Rights</h2>
          <ul style={styles.list}>
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2>Contact Us</h2>
          <p>For privacy-related questions, email us at: <strong>privacy@medivoice.ai</strong></p>
        </section>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '60px 24px',
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
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  section: {
    padding: '24px',
    background: 'var(--bg-card)',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
  },
  list: {
    paddingLeft: '20px',
    color: 'var(--text-secondary)',
    lineHeight: 1.8,
  },
};