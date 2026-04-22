import { useState, useEffect } from 'react';
import { X, Shield, Smartphone, Mail, Key, CheckCircle, AlertCircle, Copy, RefreshCw } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function TwoFactorAuth({ onClose }: Props) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [secretKey, setSecretKey] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [method, setMethod] = useState<'authenticator' | 'sms' | 'email'>('authenticator');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    load2FAStatus();
  }, []);

  const load2FAStatus = () => {
    const saved = localStorage.getItem('twoFactorEnabled');
    setIsEnabled(saved === 'true');
  };

  const generateSecret = () => {
    // Generate a random secret key (in production, this would come from backend)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 16; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSecretKey(secret);
    
    // Generate mock QR code URL (in production, use actual QR generation)
    const otpAuthUrl = `otpauth://totp/MediVoice:${email || 'user'}?secret=${secret}&issuer=MediVoice`;
    setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`);
    
    // Generate backup codes
    const codes = [];
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    setBackupCodes(codes);
  };

  const enable2FA = () => {
    if (method === 'authenticator') {
      if (!verificationCode) {
        alert('Please enter the verification code');
        return;
      }
      // In production, verify the code with backend
      if (verificationCode.length === 6) {
        setIsEnabled(true);
        localStorage.setItem('twoFactorEnabled', 'true');
        localStorage.setItem('twoFactorMethod', method);
        localStorage.setItem('twoFactorSecret', secretKey);
        localStorage.setItem('backupCodes', JSON.stringify(backupCodes));
        setSetupMode(false);
        setShowBackupCodes(true);
      } else {
        alert('Invalid verification code');
      }
    } else if (method === 'sms') {
      if (!phoneNumber) {
        alert('Please enter phone number');
        return;
      }
      setIsEnabled(true);
      localStorage.setItem('twoFactorEnabled', 'true');
      localStorage.setItem('twoFactorMethod', method);
      localStorage.setItem('twoFactorPhone', phoneNumber);
      setSetupMode(false);
      alert('Verification code sent to your phone!');
    } else if (method === 'email') {
      if (!email) {
        alert('Please enter email address');
        return;
      }
      setIsEnabled(true);
      localStorage.setItem('twoFactorEnabled', 'true');
      localStorage.setItem('twoFactorMethod', method);
      localStorage.setItem('twoFactorEmail', email);
      setSetupMode(false);
      alert('Verification code sent to your email!');
    }
  };

  const disable2FA = () => {
    if (window.confirm('Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.')) {
      setIsEnabled(false);
      localStorage.removeItem('twoFactorEnabled');
      localStorage.removeItem('twoFactorMethod');
      localStorage.removeItem('twoFactorSecret');
      localStorage.removeItem('backupCodes');
      localStorage.removeItem('twoFactorPhone');
      localStorage.removeItem('twoFactorEmail');
      alert('Two-Factor Authentication has been disabled');
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <Shield size={24} />
          </div>
          <h2 style={styles.title}>Two-Factor Authentication</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.content}>
          {!setupMode && !showBackupCodes ? (
            <>
              <div style={styles.statusCard}>
                <div style={styles.statusIcon}>
                  {isEnabled ? <CheckCircle size={32} color="#10b981" /> : <AlertCircle size={32} color="#f59e0b" />}
                </div>
                <div>
                  <h3>Status: {isEnabled ? 'Enabled' : 'Disabled'}</h3>
                  <p>{isEnabled ? 'Your account is protected with 2FA' : 'Add an extra layer of security to your account'}</p>
                </div>
              </div>

              {isEnabled ? (
                <>
                  <div style={styles.infoBox}>
                    <Shield size={18} />
                    <p>Your account is secured with {localStorage.getItem('twoFactorMethod') || 'authenticator'} 2FA</p>
                  </div>
                  <button onClick={disable2FA} style={styles.disableButton}>
                    Disable 2FA
                  </button>
                </>
              ) : (
                <button onClick={() => {
                  setSetupMode(true);
                  generateSecret();
                }} style={styles.enableButton}>
                  Set Up Two-Factor Authentication
                </button>
              )}

              <div style={styles.featuresSection}>
                <h4>Why enable 2FA?</h4>
                <div style={styles.featuresGrid}>
                  <div style={styles.featureItem}>
                    <Shield size={20} />
                    <span>Extra security layer</span>
                  </div>
                  <div style={styles.featureItem}>
                    <Smartphone size={20} />
                    <span>Protects from unauthorized access</span>
                  </div>
                  <div style={styles.featureItem}>
                    <Key size={20} />
                    <span>Backup codes provided</span>
                  </div>
                </div>
              </div>
            </>
          ) : showBackupCodes ? (
            <div style={styles.backupSection}>
              <h3>Save Your Backup Codes</h3>
              <p>These codes can be used to access your account if you lose your device. Store them in a safe place.</p>
              <div style={styles.backupCodesGrid}>
                {backupCodes.map((code, i) => (
                  <div key={i} style={styles.backupCode}>{code}</div>
                ))}
              </div>
              <div style={styles.backupActions}>
                <button onClick={copyBackupCodes} style={styles.copyButton}>
                  <Copy size={16} /> {copied ? 'Copied!' : 'Copy Codes'}
                </button>
                <button onClick={downloadBackupCodes} style={styles.downloadButton}>
                  Download Codes
                </button>
              </div>
              <button onClick={() => {
                setShowBackupCodes(false);
                onClose();
              }} style={styles.doneButton}>
                I've Saved My Codes
              </button>
            </div>
          ) : (
            <div style={styles.setupSection}>
              <h3>Choose 2FA Method</h3>
              
              <div style={styles.methodSelector}>
                <button
                  onClick={() => setMethod('authenticator')}
                  style={{ ...styles.methodButton, ...(method === 'authenticator' ? styles.methodActive : {}) }}
                >
                  <Smartphone size={20} />
                  Authenticator App
                </button>
                <button
                  onClick={() => setMethod('sms')}
                  style={{ ...styles.methodButton, ...(method === 'sms' ? styles.methodActive : {}) }}
                >
                  <Mail size={20} />
                  SMS
                </button>
                <button
                  onClick={() => setMethod('email')}
                  style={{ ...styles.methodButton, ...(method === 'email' ? styles.methodActive : {}) }}
                >
                  <Mail size={20} />
                  Email
                </button>
              </div>

              {method === 'authenticator' && (
                <div style={styles.authenticatorSetup}>
                  <p>1. Install an authenticator app like Google Authenticator or Microsoft Authenticator</p>
                  <p>2. Scan the QR code below:</p>
                  {qrCode && (
                    <div style={styles.qrContainer}>
                      <img src={qrCode} alt="QR Code" style={styles.qrCode} />
                    </div>
                  )}
                  <p>3. Or enter this code manually:</p>
                  <div style={styles.secretKey}>
                    <code>{secretKey}</code>
                    <button onClick={() => {
                      navigator.clipboard.writeText(secretKey);
                      alert('Secret key copied!');
                    }} style={styles.copySecretButton}>
                      <Copy size={14} />
                    </button>
                  </div>
                  <p>4. Enter the 6-digit code from your authenticator app:</p>
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    style={styles.codeInput}
                  />
                </div>
              )}

              {method === 'sms' && (
                <div style={styles.smsSetup}>
                  <p>Enter your phone number to receive verification codes via SMS:</p>
                  <input
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    style={styles.phoneInput}
                  />
                  <p style={styles.note}>Standard message rates may apply</p>
                </div>
              )}

              {method === 'email' && (
                <div style={styles.emailSetup}>
                  <p>Enter your email address to receive verification codes:</p>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.emailInput}
                  />
                </div>
              )}

              <div style={styles.setupActions}>
                <button onClick={() => setSetupMode(false)} style={styles.cancelSetupButton}>
                  Cancel
                </button>
                <button onClick={enable2FA} style={styles.confirmButton}>
                  Enable 2FA
                </button>
              </div>
            </div>
          )}
        </div>
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
    zIndex: 1000,
  },
  modal: {
    background: 'var(--bg-card)',
    borderRadius: '24px',
    maxWidth: '550px',
    width: '90%',
    maxHeight: '85vh',
    overflow: 'auto' as const,
    boxShadow: '0 20px 35px -10px rgba(0,0,0,0.2)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 24px',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },
  headerIcon: {
    width: '36px',
    height: '36px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '10px',
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
  statusCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: 'var(--badge-bg)',
    borderRadius: '16px',
    marginBottom: '24px',
  },
  statusIcon: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  enableButton: {
    width: '100%',
    padding: '14px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 500,
    marginBottom: '24px',
  },
  disableButton: {
    width: '100%',
    padding: '14px',
    background: 'transparent',
    border: '1px solid #ef4444',
    color: '#ef4444',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 500,
  },
  featuresSection: {
    marginTop: '20px',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginTop: '12px',
  },
  featureItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    background: 'var(--badge-bg)',
    borderRadius: '10px',
    fontSize: '12px',
  },
  setupSection: {
    marginBottom: '20px',
  },
  methodSelector: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
  },
  methodButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    background: 'var(--badge-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  methodActive: {
    background: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#ef4444',
    color: '#ef4444',
  },
  authenticatorSetup: {
    marginTop: '20px',
  },
  qrContainer: {
    display: 'flex',
    justifyContent: 'center',
    margin: '20px 0',
  },
  qrCode: {
    width: '200px',
    height: '200px',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
  },
  secretKey: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px',
    background: 'var(--badge-bg)',
    borderRadius: '8px',
    marginTop: '8px',
  },
  copySecretButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  codeInput: {
    width: '100%',
    padding: '12px',
    textAlign: 'center' as const,
    fontSize: '24px',
    letterSpacing: '8px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '10px',
    marginTop: '12px',
  },
  phoneInput: {
    width: '100%',
    padding: '12px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '10px',
    marginTop: '12px',
  },
  emailInput: {
    width: '100%',
    padding: '12px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '10px',
    marginTop: '12px',
  },
  note: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '8px',
  },
  setupActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  cancelSetupButton: {
    flex: 1,
    padding: '12px',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  confirmButton: {
    flex: 1,
    padding: '12px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  backupSection: {
    textAlign: 'center' as const,
  },
  backupCodesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    margin: '20px 0',
  },
  backupCode: {
    padding: '10px',
    background: 'var(--badge-bg)',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '14px',
    textAlign: 'center' as const,
  },
  backupActions: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  copyButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    background: 'var(--badge-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  downloadButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    background: 'var(--badge-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  doneButton: {
    width: '100%',
    padding: '12px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  smsSetup: {
    marginTop: '20px',
  },
  emailSetup: {
    marginTop: '20px',
  },
};