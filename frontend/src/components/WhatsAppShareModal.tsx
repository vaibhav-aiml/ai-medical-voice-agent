import { useState } from 'react';
import { X, MessageCircle, Copy, Check } from 'lucide-react';
import WhatsAppButton from './WhatsAppButton';

interface Props {
  message: string;
  title: string;
  onClose: () => void;
}

export default function WhatsAppShareModal({ message, title, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.content}>
          <p style={styles.description}>
            Share this information with your family, doctor, or save it for your records.
          </p>

          <div style={styles.previewBox}>
            <p style={styles.previewLabel}>Preview message:</p>
            <div style={styles.previewContent}>
              {message.substring(0, 200)}...
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.shareOptions}>
            <WhatsAppButton
              message={message}
              label="Share via WhatsApp"
              size="large"
            />
            
            <button onClick={handleCopyLink} style={styles.copyButton}>
              {copied ? <Check size={18} /> : <Copy size={18} />}
              <span>{copied ? 'Copied!' : 'Copy Message'}</span>
            </button>
          </div>
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
    zIndex: 1001,
  },
  modal: {
    background: 'var(--bg-card)',
    borderRadius: '20px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto' as const,
    boxShadow: '0 20px 35px -10px rgba(0,0,0,0.2)',
    border: '1px solid var(--border-color)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid var(--border-color)',
  },
  title: {
    margin: 0,
    color: 'var(--text-primary)',
    fontSize: '18px',
    fontWeight: 600,
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  content: {
    padding: '24px',
  },
  description: {
    marginBottom: '16px',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
  },
  previewBox: {
    background: 'var(--badge-bg)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
  },
  previewLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '8px',
  },
  previewContent: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
  },
  divider: {
    height: '1px',
    background: 'var(--border-color)',
    margin: '16px 0',
  },
  shareOptions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  copyButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    transition: 'all 0.2s ease',
  },
};