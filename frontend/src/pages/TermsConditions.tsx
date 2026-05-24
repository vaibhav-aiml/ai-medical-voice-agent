import BackButton from '../components/BackButton';

export default function TermsConditions() {
  return (
    <div style={styles.container}>
      {/* Back Button */}
      <BackButton />

      <div style={styles.hero}>
        <h1 style={styles.title}>Terms & <span style={styles.accent}>Conditions</span></h1>
      </div>

      <div style={styles.content}>
        <section style={styles.section}>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using MediVoice AI, you agree to be bound by these Terms & Conditions. If you disagree with any part, please do not use our services.</p>
        </section>

        <section style={styles.section}>
          <h2>2. Description of Service</h2>
          <p>MediVoice AI provides AI-powered medical consultation services. Our AI analyzes symptoms and provides general medical information. This is not a substitute for professional medical advice.</p>
        </section>

        <section style={styles.section}>
          <h2>3. User Responsibilities</h2>
          <ul style={styles.list}>
            <li>Provide accurate and truthful information about your symptoms</li>
            <li>Not misuse the platform for any unlawful purposes</li>
            <li>Consult a qualified doctor for serious medical conditions</li>
            <li>Keep your account credentials secure</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2>4. Medical Disclaimer</h2>
          <p>⚠️ <strong>Important:</strong> MediVoice AI is an informational tool only. It does not provide medical diagnosis or treatment recommendations. Always consult a qualified healthcare provider for medical advice.</p>
        </section>

        <section style={styles.section}>
          <h2>5. Limitation of Liability</h2>
          <p>MediVoice AI shall not be liable for any damages arising from the use of our services. You use the platform at your own risk.</p>
        </section>

        <section style={styles.section}>
          <h2>6. Governing Law</h2>
          <p>These terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Jaipur, Rajasthan.</p>
        </section>

        <section style={styles.section}>
          <h2>7. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of the modified terms.</p>
        </section>

        <section style={styles.section}>
          <h2>8. Contact Us</h2>
          <p>For questions about these Terms, contact us at: <strong>legal@medivoice.ai</strong></p>
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