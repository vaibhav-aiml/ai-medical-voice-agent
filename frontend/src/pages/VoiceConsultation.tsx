import { Mic, Headphones, Clock, CheckCircle, ArrowRight } from 'lucide-react';

export default function VoiceConsultation() {
  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.heroIcon}>
          <Mic size={48} color="#3b82f6" />
        </div>
        <h1 style={styles.title}>Voice <span style={styles.accent}>Consultation</span></h1>
        <p style={styles.subtitle}>Speak naturally. Get instant AI responses.</p>
      </div>

      <div style={styles.content}>
        <section style={styles.section}>
          <h2>How It Works</h2>
          <div style={styles.steps}>
            <div style={styles.step}>
              <div style={styles.stepNumber}>1</div>
              <h3>Click "Start Speaking"</h3>
              <p>Allow microphone access and start speaking your symptoms naturally</p>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>2</div>
              <h3>AI Listens & Transcribes</h3>
              <p>Our AI converts your speech to text in real-time</p>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>3</div>
              <h3>Get AI Response</h3>
              <p>Receive personalized medical advice from our AI doctor</p>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2>Benefits</h2>
          <div style={styles.benefits}>
            <div style={styles.benefit}>
              <Headphones size={24} color="#3b82f6" />
              <div>
                <h3>Hands-Free</h3>
                <p>No typing required - just speak naturally</p>
              </div>
            </div>
            <div style={styles.benefit}>
              <Clock size={24} color="#3b82f6" />
              <div>
                <h3>Real-Time</h3>
                <p>Instant transcription and response</p>
              </div>
            </div>
            <div style={styles.benefit}>
              <CheckCircle size={24} color="#3b82f6" />
              <div>
                <h3>Accurate</h3>
                <p>Powered by advanced speech recognition</p>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2>Frequently Asked Questions</h2>
          <div style={styles.faq}>
            <div style={styles.faqItem}>
              <h3>Is voice consultation free?</h3>
              <p>Yes! Free users get 5 consultations per month. Upgrade for unlimited access.</p>
            </div>
            <div style={styles.faqItem}>
              <h3>What languages are supported?</h3>
              <p>Currently supports English and 9 Indian languages including Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, and Punjabi.</p>
            </div>
            <div style={styles.faqItem}>
              <h3>Do I need any special equipment?</h3>
              <p>Just a device with a microphone (laptop, smartphone, or tablet with mic).</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  hero: {
    textAlign: 'center' as const,
    marginBottom: '48px',
  },
  heroIcon: {
    marginBottom: '24px',
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
    gap: '32px',
  },
  section: {
    padding: '32px',
    background: 'var(--bg-card)',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
  },
  steps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginTop: '24px',
  },
  step: {
    textAlign: 'center' as const,
  },
  stepNumber: {
    width: '40px',
    height: '40px',
    background: '#3b82f6',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '0 auto 16px',
  },
  benefits: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginTop: '24px',
  },
  benefit: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  faq: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    marginTop: '24px',
  },
  faqItem: {
    padding: '16px',
    background: 'var(--badge-bg)',
    borderRadius: '12px',
  },
};