import { MessageCircle } from 'lucide-react';

interface Props {
  message: string;
  phoneNumber?: string;
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function WhatsAppButton({ message, phoneNumber, label = 'Share on WhatsApp', size = 'medium' }: Props) {
  const handleClick = () => {
    const formattedNumber = phoneNumber ? phoneNumber.replace(/\s/g, '') : '';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = formattedNumber 
      ? `https://wa.me/${formattedNumber}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const getSizeStyles = () => {
    switch(size) {
      case 'small':
        return { padding: '6px 12px', fontSize: '12px', gap: '6px' };
      case 'large':
        return { padding: '14px 28px', fontSize: '16px', gap: '10px' };
      default:
        return { padding: '10px 20px', fontSize: '14px', gap: '8px' };
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        ...styles.button,
        ...getSizeStyles(),
      }}
    >
      <MessageCircle size={size === 'small' ? 16 : size === 'large' ? 22 : 18} />
      <span>{label}</span>
    </button>
  );
}

const styles = {
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: '#25D366',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
  },
};