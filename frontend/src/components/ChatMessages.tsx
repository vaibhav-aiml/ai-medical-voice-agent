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
    color: '#333',
  },
  messagesContainer: {
    maxHeight: '400px',
    overflowY: 'auto' as const,
    padding: '10px',
    background: '#f8f9fa',
    borderRadius: '10px',
  },
  message: {
    marginBottom: '15px',
    padding: '12px',
    borderRadius: '8px',
  },
  userMessage: {
    background: '#667eea',
    color: 'white',
    textAlign: 'right' as const,
  },
  aiMessage: {
    background: 'white',
    border: '1px solid #ddd',
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '12px',
  },
  messageContent: {
    fontSize: '14px',
    lineHeight: '1.5',
  },
  emptyMessage: {
    textAlign: 'center' as const,
    color: '#999',
    padding: '40px',
  },
};