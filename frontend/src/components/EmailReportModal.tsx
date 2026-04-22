import { useState } from 'react';
import { Mail, Send, X } from 'lucide-react';

interface Props {
  consultationId: string;
  patientName: string;
  specialistType: string;
  specialistName: string;
  symptoms: string;
  diagnosis: string;
  recommendations: string[];
  medications: Array<{ name: string; dosage: string; frequency: string; duration: string }>;
  pdfData: string;
  onClose: () => void;
}

export default function EmailReportModal({ 
  consultationId, 
  patientName, 
  specialistType, 
  specialistName, 
  symptoms, 
  diagnosis, 
  recommendations, 
  medications, 
  pdfData,
  onClose 
}: Props) {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendEmail = async () => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    setIsSending(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/email/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          patientName,
          consultationId,
          specialistType,
          specialistName,
          date: new Date(),
          symptoms,
          diagnosis,
          recommendations,
          medications,
          pdfBuffer: pdfData,
        }),
      });
      
      if (response.ok) {
        setSent(true);
        setTimeout(() => {
          onClose();
          setSent(false);
          setEmail('');
        }, 2000);
      } else {
        alert('Failed to send email. Please try again.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email. Please check your connection.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <Mail size={24} />
          </div>
          <h2 style={styles.title}>Email Medical Report</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>
        
        <div style={styles.content}>
          {!sent ? (
            <>
              <p style={styles.description}>
                Send your medical report as a PDF to your email address. You can share it with your doctor or save it for your records.
              </p>
              
              <div style={styles.infoBox}>
                <p><strong>📄 Report ID:</strong> {consultationId}</p>
                <p><strong>👨‍⚕️ Specialist:</strong> {specialistName}</p>
                <p><strong>📅 Date:</strong> {new Date().toLocaleDateString()}</p>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address</label>
                <div style={styles.inputWrapper}>
                  <Mail size={18} style={styles.inputIcon} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    style={styles.input}
                  />
                </div>
                <p style={styles.hint}>We'll send the PDF report to this email address</p>
              </div>
            </>
          ) : (
            <div style={styles.successBox}>
              <div style={styles.successIcon}>✅</div>
              <h3>Report Sent Successfully!</h3>
              <p>The medical report has been sent to {email}</p>
              <p style={styles.checkEmail}>Please check your inbox (and spam folder)</p>
            </div>
          )}
        </div>
        
        {!sent && (
          <div style={styles.footer}>
            <button onClick={onClose} style={styles.cancelButton}>
              Cancel
            </button>
            <button 
              onClick={handleSendEmail} 
              style={styles.sendButton}
              disabled={isSending || !email}
            >
              {isSending ? (
                <>Sending...</>
              ) : (
                <>
                  <Send size={16} />
                  <span>Send Report</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
  },
  modal: {
    background: 'var(--bg-card)',
    borderRadius: '20px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 20px 35px -10px rgba(0,0,0,0.2)',
    overflow: 'hidden' as const,
    border: '1px solid var(--border-color)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 24px',
    background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
    color: 'white',
    position: 'relative' as const,
  },
  headerIcon: {
    width: '40px',
    height: '40px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '20px',
    fontWeight: 600,
    margin: 0,
    flex: 1,
  },
  closeButton: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: 'white',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: '24px',
  },
  description: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '20px',
    lineHeight: 1.5,
  },
  infoBox: {
    background: 'var(--badge-bg)',
    padding: '15px',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '13px',
    border: '1px solid var(--border-color)',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  inputWrapper: {
    position: 'relative' as const,
  },
  inputIcon: {
    position: 'absolute' as const,
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '1px solid var(--input-border)',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    background: 'var(--input-bg)',
    color: 'var(--text-primary)',
  },
  hint: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '8px',
  },
  footer: {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px',
    borderTop: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
  },
  cancelButton: {
    flex: 1,
    padding: '10px',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  sendButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    background: 'var(--button-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  successBox: {
    textAlign: 'center' as const,
    padding: '20px',
  },
  successIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  checkEmail: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '10px',
  },
};