import { useState } from 'react';
import { Star, X, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Props {
  consultationId: string;
  consultationTitle: string;
  onClose: () => void;
  onSubmit: (rating: number, feedback: string) => void;
}

export default function ConsultationRating({ consultationId, consultationTitle, onClose, onSubmit }: Props) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedAspects, setSelectedAspects] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const aspects = [
    { id: 'accuracy', label: 'Medical Accuracy', icon: '🩺' },
    { id: 'helpfulness', label: 'Helpfulness', icon: '💡' },
    { id: 'clarity', label: 'Clear Communication', icon: '🗣️' },
    { id: 'responseTime', label: 'Response Time', icon: '⚡' },
    { id: 'professionalism', label: 'Professionalism', icon: '👔' },
  ];

  const toggleAspect = (aspectId: string) => {
    if (selectedAspects.includes(aspectId)) {
      setSelectedAspects(selectedAspects.filter(a => a !== aspectId));
    } else {
      setSelectedAspects([...selectedAspects, aspectId]);
    }
  };

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Please select a rating before submitting');
      return;
    }
    const fullFeedback = `${feedback}\n\n⭐ Rating: ${rating}/5\n✅ Good aspects: ${selectedAspects.join(', ')}`;
    onSubmit(rating, fullFeedback);
    setSubmitted(true);
    setTimeout(() => onClose(), 2000);
  };

  const getRatingText = (value: number) => {
    switch(value) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  if (submitted) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.successContainer}>
            <div style={styles.successIcon}>⭐</div>
            <h3>Thank You for Your Feedback!</h3>
            <p>Your rating helps us improve our AI doctors.</p>
            <button onClick={onClose} style={styles.closeSuccessButton}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <Star size={24} />
          </div>
          <h2 style={styles.title}>Rate Your Consultation</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.content}>
          <div style={styles.consultationInfo}>
            <p><strong>Consultation:</strong> {consultationTitle}</p>
            <p><strong>ID:</strong> {consultationId}</p>
          </div>

          <div style={styles.ratingSection}>
            <label style={styles.label}>How would you rate this consultation?</label>
            <div style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={40}
                  style={{
                    ...styles.star,
                    fill: star <= (hoverRating || rating) ? '#fbbf24' : 'none',
                    stroke: star <= (hoverRating || rating) ? '#fbbf24' : '#d1d5db',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
            {rating > 0 && (
              <div style={styles.ratingText}>
                <strong>{getRatingText(rating)}</strong>
              </div>
            )}
          </div>

          <div style={styles.aspectsSection}>
            <label style={styles.label}>What went well? (Select all that apply)</label>
            <div style={styles.aspectsGrid}>
              {aspects.map((aspect) => (
                <button
                  key={aspect.id}
                  onClick={() => toggleAspect(aspect.id)}
                  style={{
                    ...styles.aspectButton,
                    ...(selectedAspects.includes(aspect.id) ? styles.aspectButtonSelected : {}),
                  }}
                >
                  <span style={styles.aspectIcon}>{aspect.icon}</span>
                  <span>{aspect.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={styles.feedbackSection}>
            <label style={styles.label}>Additional Feedback (Optional)</label>
            <textarea
              placeholder="Share your experience... What did you like? What could be improved?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              style={styles.textarea}
              rows={4}
            />
          </div>

          <div style={styles.footer}>
            <button onClick={onClose} style={styles.cancelButton}>
              Cancel
            </button>
            <button onClick={handleSubmit} style={styles.submitButton}>
              Submit Rating
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
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
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
  consultationInfo: {
    background: 'var(--badge-bg)',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '13px',
  },
  ratingSection: {
    marginBottom: '24px',
    textAlign: 'center' as const,
  },
  label: {
    display: 'block',
    marginBottom: '12px',
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  starsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  star: {
    transition: 'transform 0.2s ease',
  },
  ratingText: {
    marginTop: '8px',
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  aspectsSection: {
    marginBottom: '24px',
  },
  aspectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '10px',
  },
  aspectButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    background: 'var(--badge-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    color: 'var(--text-primary)',
    transition: 'all 0.2s ease',
  },
  aspectButtonSelected: {
    background: 'rgba(245, 158, 11, 0.1)',
    borderColor: '#f59e0b',
    color: '#f59e0b',
  },
  aspectIcon: {
    fontSize: '18px',
  },
  feedbackSection: {
    marginBottom: '24px',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  },
  footer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '10px 20px',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  submitButton: {
    padding: '10px 20px',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  },
  successContainer: {
    textAlign: 'center' as const,
    padding: '40px',
  },
  successIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  closeSuccessButton: {
    marginTop: '20px',
    padding: '10px 20px',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
};