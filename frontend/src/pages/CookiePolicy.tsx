import BackButton from '../components/BackButton';

export default function CookiePolicy() {
  return (
    <div style={styles.container}>
      {/* Back Button */}
      <BackButton />

      <div style={styles.hero}>
        <h1 style={styles.title}>Cookie <span style={styles.accent}>Policy</span></h1>
        <p style={styles.subtitle}>How We Use Cookies to Enhance Your Experience</p>
      </div>

      <div style={styles.content}>
        <section style={styles.section}>
          <h2>What Are Cookies?</h2>
          <p>Cookies are small text files placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.</p>
        </section>

        <section style={styles.section}>
          <h2>Types of Cookies We Use</h2>
          <ul style={styles.list}>
            <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our site</li>
            <li><strong>Security Cookies:</strong> Protect your account and data</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2>Third-Party Cookies</h2>
          <p>We use trusted third-party services that may set cookies on our behalf:</p>
          <ul style={styles.list}>
            <li>Google Analytics - for website analytics</li>
            <li>Clerk - for authentication and security</li>
            <li>Groq/OpenAI - for AI consultation services</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2>Managing Cookies</h2>
          <p>You can control cookies through your browser settings. Most browsers allow you to:</p>
          <ul style={styles.list}>
            <li>View all cookies stored on your device</li>
            <li>Delete existing cookies</li>
            <li>Block cookies from specific websites</li>
            <li>Set preferences for future cookie storage</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2>Contact Us</h2>
          <p>If you have questions about our cookie usage, please contact us at: <strong>privacy@medivoice.ai</strong></p>
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