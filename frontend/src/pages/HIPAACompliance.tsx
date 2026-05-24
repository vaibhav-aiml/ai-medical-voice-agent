import BackButton from '../components/BackButton';

export default function HIPAACompliance() {
  return (
    <div style={styles.container}>
      {/* Back Button */}
      <BackButton />

      <div style={styles.hero}>
        <h1 style={styles.title}>HIPAA <span style={styles.accent}>Compliance</span></h1>
        <p style={styles.subtitle}>Your Health Information Privacy is Our Priority</p>
      </div>

      <div style={styles.content}>
        <section style={styles.section}>
          <h2>What is HIPAA?</h2>
          <p>The Health Insurance Portability and Accountability Act (HIPAA) is a US federal law that protects sensitive patient health information from being disclosed without the patient's consent or knowledge.</p>
        </section>

        <section style={styles.section}>
          <h2>Our Commitment to Compliance</h2>
          <p>At MediVoice AI, we are committed to protecting your health information with the highest security standards. While we operate globally, we adhere to HIPAA principles to ensure your data is handled with care.</p>
        </section>

        <section style={styles.section}>
          <h2>Data Protection Measures</h2>
          <ul style={styles.list}>
            <li><strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
            <li><strong>Access Controls:</strong> Strict authentication and authorization protocols</li>
            <li><strong>Audit Logs:</strong> Complete tracking of all data access</li>
            <li><strong>Secure Storage:</strong> Data stored in ISO 27001 certified facilities</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2>Your Rights Under HIPAA</h2>
          <ul style={styles.list}>
            <li>Right to access your medical information</li>
            <li>Right to request corrections to your records</li>
            <li>Right to know who has accessed your information</li>
            <li>Right to request restrictions on data sharing</li>
            <li>Right to file a complaint about privacy violations</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2>Contact Our Privacy Officer</h2>
          <p>For privacy-related concerns, contact our HIPAA Privacy Officer:</p>
          <p><strong>Email:</strong> privacy@medivoice.ai</p>
          <p><strong>Phone:</strong> +91 98765 43210</p>
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
  subtitle: {
    fontSize: '18px',
    color: 'var(--text-secondary)',
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
    marginTop: '12px',
  },
};