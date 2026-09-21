import { Mic, Headphones, Clock, CheckCircle } from 'lucide-react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import MobileCarousel from '../components/shared/MobileCarousel';

export default function VoiceConsultation() {
  const { isMobile, isTablet } = useBreakpoint();
  return (
    <div className="page-shell" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{...styles.hero, ...(isMobile ? { marginBottom: '24px' } : {})}}>
        <div style={styles.heroIcon}>
          <Mic size={isMobile ? 36 : 48} color="var(--accent-clinical)" />
        </div>
        <h1 style={{...styles.title, ...(isMobile ? { fontSize: '28px' } : {})}}>Voice <span style={styles.accent}>Consultation</span></h1>
        <p style={{...styles.subtitle, ...(isMobile ? { fontSize: '15px' } : {})}}>Speak naturally. Get instant AI responses.</p>
      </div>

      <div style={styles.content}>
        <section style={{...styles.section, ...(isMobile ? { padding: '20px 16px' } : {})}}>
          <h2>How It Works</h2>
          {isMobile ? (
            <MobileCarousel peekWidth={85} gap={12}>
              <div style={styles.step}>
                <div style={{ fontSize: '11px', color: 'var(--accent-clinical)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' as const }}>Step 1 of 3</div>
                <div style={styles.stepNumber}>1</div>
                <h3>Click "Start Speaking"</h3>
                <p>Allow microphone access and start speaking your symptoms naturally</p>
              </div>
              <div style={styles.step}>
                <div style={{ fontSize: '11px', color: 'var(--accent-clinical)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' as const }}>Step 2 of 3</div>
                <div style={styles.stepNumber}>2</div>
                <h3>AI Listens & Transcribes</h3>
                <p>Our AI converts your speech to text in real-time</p>
              </div>
              <div style={styles.step}>
                <div style={{ fontSize: '11px', color: 'var(--accent-clinical)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' as const }}>Step 3 of 3</div>
                <div style={styles.stepNumber}>3</div>
                <h3>Get AI Response</h3>
                <p>Receive personalized medical advice from our AI doctor</p>
              </div>
            </MobileCarousel>
          ) : (
            <div style={{...styles.steps, gridTemplateColumns: isTablet ? '1fr 1fr' : 'repeat(3, 1fr)'}}>
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
          )}
        </section>

        <section style={{...styles.section, ...(isMobile ? { padding: '20px 16px', borderRadius: '16px' } : {})}}>
          <h2>Benefits</h2>
          <div style={{
            ...styles.benefits,
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3, 1fr)',
            ...(isMobile ? { gap: '12px', marginTop: '16px' } : {})
          }}>
            <div style={{
              ...styles.benefit,
              ...(isMobile ? {
                padding: '16px',
                minHeight: '48px',
                borderRadius: '12px',
                background: 'var(--badge-bg)',
                border: '1px solid var(--border-color)',
              } : {})
            }}>
              <Headphones size={24} color="#3b82f6" style={{ flexShrink: 0 }} />
              <div>
                <h3 style={isMobile ? { fontSize: '15px', marginBottom: '2px' } : {}}>Hands-Free</h3>
                <p style={isMobile ? { fontSize: '13px', margin: 0 } : {}}>No typing required - just speak naturally</p>
              </div>
            </div>
            <div style={{
              ...styles.benefit,
              ...(isMobile ? {
                padding: '16px',
                minHeight: '48px',
                borderRadius: '12px',
                background: 'var(--badge-bg)',
                border: '1px solid var(--border-color)',
              } : {})
            }}>
              <Clock size={24} color="#3b82f6" style={{ flexShrink: 0 }} />
              <div>
                <h3 style={isMobile ? { fontSize: '15px', marginBottom: '2px' } : {}}>Real-Time</h3>
                <p style={isMobile ? { fontSize: '13px', margin: 0 } : {}}>Instant transcription and response</p>
              </div>
            </div>
            <div style={{
              ...styles.benefit,
              ...(isMobile ? {
                padding: '16px',
                minHeight: '48px',
                borderRadius: '12px',
                background: 'var(--badge-bg)',
                border: '1px solid var(--border-color)',
              } : {})
            }}>
              <CheckCircle size={24} color="#3b82f6" style={{ flexShrink: 0 }} />
              <div>
                <h3 style={isMobile ? { fontSize: '15px', marginBottom: '2px' } : {}}>Accurate</h3>
                <p style={isMobile ? { fontSize: '13px', margin: 0 } : {}}>Powered by advanced speech recognition</p>
              </div>
            </div>
          </div>
        </section>

        <section style={{...styles.section, ...(isMobile ? { padding: '20px 16px', borderRadius: '16px' } : {})}}>
          <h2>Frequently Asked Questions</h2>
          <div style={{...styles.faq, ...(isMobile ? { gap: '12px', marginTop: '16px' } : {})}}>
            <div style={{...styles.faqItem, ...(isMobile ? { padding: '16px', minHeight: '48px' } : {})}}>
              <h3 style={isMobile ? { fontSize: '15px', marginBottom: '4px' } : {}}>Is voice consultation free?</h3>
              <p style={isMobile ? { fontSize: '13px', lineHeight: '1.5', margin: 0 } : {}}>Yes! Free users get 5 consultations per month. Upgrade for unlimited access.</p>
            </div>
            <div style={{...styles.faqItem, ...(isMobile ? { padding: '16px', minHeight: '48px' } : {})}}>
              <h3 style={isMobile ? { fontSize: '15px', marginBottom: '4px' } : {}}>What languages are supported?</h3>
              <p style={isMobile ? { fontSize: '13px', lineHeight: '1.5', margin: 0 } : {}}>Currently supports English and 9 Indian languages including Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, and Punjabi.</p>
            </div>
            <div style={{...styles.faqItem, ...(isMobile ? { padding: '16px', minHeight: '48px' } : {})}}>
              <h3 style={isMobile ? { fontSize: '15px', marginBottom: '4px' } : {}}>Do I need any special equipment?</h3>
              <p style={isMobile ? { fontSize: '13px', lineHeight: '1.5', margin: 0 } : {}}>Just a device with a microphone (laptop, smartphone, or tablet with mic).</p>
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
    color: 'var(--accent-clinical)',
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