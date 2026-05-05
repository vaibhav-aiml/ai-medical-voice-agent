import { Message } from '../types/consultation.types';

interface Props {
  messages: Message[];
}

export default function ChatMessages({ messages }: Props) {
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Consultation Chat</h3>
      <div style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <p style={styles.emptyMessage}>Start speaking to begin consultation...</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              style={{
                ...styles.message,
                ...(message.type === 'user' ? styles.userMessage : styles.aiMessage),
              }}
            >
              <div style={styles.messageHeader}>
                <strong>{message.type === 'user' ? 'You' : 'AI Doctor'}</strong>
                <small>{new Date(message.timestamp).toLocaleTimeString()}</small>
              </div>
              <div style={styles.messageContent}>{message.content}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    marginTop: '30px',
  },
  title: {
    fontSize: '20px',
    marginBottom: '15px',
    color: 'var(--text-primary)',
  },
  messagesContainer: {
    maxHeight: '450px',
    overflowY: 'auto' as const,
    padding: '15px',
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
  },
  message: {
    marginBottom: '16px',
    padding: '14px',
    borderRadius: '12px',
    maxWidth: '85%',
  },
  userMessage: {
    background: '#3b82f6',
    color: 'white',
    textAlign: 'right' as const,
    marginLeft: 'auto',
  },
  aiMessage: {
    background: '#1e293b',
    color: '#f1f5f9',
    border: '1px solid #334155',
    textAlign: 'left' as const,
    marginRight: 'auto',
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '11px',
    opacity: 0.8,
  },
  messageContent: {
    fontSize: '14px',
    lineHeight: '1.5',
    wordWrap: 'break-word' as const,
    whiteSpace: 'pre-wrap' as const,
  },
  emptyMessage: {
    textAlign: 'center' as const,
    color: 'var(--text-secondary)',
    padding: '40px',
  },
};