import { useState, useEffect, useRef } from 'react';
import { Message } from '../types/consultation.types';
import { safetyGuardrail } from '../services/safetyGuardrail';
import { auditLogger } from '../services/auditLogger';
import { hipaaCompliance } from '../services/hipaaCompliance';
import CrisisAlert from './CrisisAlert';

interface Props {
  messages: Message[];
  onAddMessage?: (message: Message) => void;
  sessionId?: string;
  userId?: string;
  triageResult?: {
    urgencyLevel: string;
    score: number;
    recommendation: string;
    colorCode: string;
  } | null;
  streamingMessage?: string;
  isStreaming?: boolean;
}

export default function ChatMessages({ 
  messages, 
  onAddMessage, 
  sessionId, 
  userId, 
  triageResult,
  streamingMessage = '',
  isStreaming = false
}: Props) {
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [crisisResource, setCrisisResource] = useState<any>(null);
  const [processedMessages, setProcessedMessages] = useState<any[]>([]);
  const crisisHandledRef = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [expandedTranslations, setExpandedTranslations] = useState<Record<string, boolean>>({});

  const toggleTranslation = (messageId: string) => {
    setExpandedTranslations(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  // Get color for urgency banner
  const getUrgencyColor = (colorCode: string) => {
    switch (colorCode) {
      case 'red': return { bg: '#dc2626', text: 'white', icon: '🚨', label: 'EMERGENCY' };
      case 'orange': return { bg: '#ea580c', text: 'white', icon: '🟠', label: 'URGENT - 24 HOURS' };
      case 'yellow': return { bg: '#ca8a04', text: 'white', icon: '🟡', label: 'SEE DOCTOR - 48 HOURS' };
      default: return { bg: '#16a34a', text: 'white', icon: '🟢', label: 'ROUTINE' };
    }
  };

  // Get urgency display text
  const getUrgencyDisplay = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'emergency_immediate': return '🚨 EMERGENCY - Call 108 Now';
      case 'consult_24h': return '🟠 URGENT - See Doctor Within 24 Hours';
      case 'consult_48h': return '🟡 Schedule Appointment Within 48 Hours';
      default: return '🟢 Routine - Monitor Symptoms';
    }
  };

  // Process messages when they change
  useEffect(() => {
    const processMessages = async () => {
      const processed = [];
      
      for (const msg of messages) {
        // Only check user messages for crisis
        if (msg.type === 'user') {
          const safetyCheck = safetyGuardrail.analyzeMessage(msg.content);
          
          if (safetyCheck.crisisDetected) {
            if (!crisisHandledRef.current.has(msg.id)) {
              crisisHandledRef.current.add(msg.id);
              
              if (sessionId && userId) {
                auditLogger.log(userId, sessionId, 'crisis_detected', msg.content, {
                  crisisDetected: true,
                  crisisType: safetyCheck.crisisType
                });
              }
              
              if (safetyCheck.resource) {
                setCrisisResource(safetyCheck.resource);
                setShowCrisisAlert(true);
              }
              
              if (onAddMessage) {
                const crisisResponse: Message = {
                  id: `crisis_${Date.now()}`,
                  content: "⚠️ Crisis Support Resources\n\nI care about your safety. Please reach out for immediate help:\n\n📞 988 - Suicide & Crisis Lifeline (24/7)\n📞 911 - Emergency Services\n\nYou are not alone. Please call now for confidential support.",
                  type: 'ai',
                  timestamp: new Date(),
                };
                onAddMessage(crisisResponse);
              }
            }
            continue;
          }
        }
        
        let isPHIProtected = false;
        let displayContent = msg.content;
        
        if (msg.type === 'user') {
          const containsPHI = hipaaCompliance.containsPHI(msg.content);
          if (containsPHI && sessionId && userId) {
            hipaaCompliance.logPHIAccess({
              type: 'medical_record',
              value: hipaaCompliance.anonymizeForAI(msg.content),
              accessReason: 'Chat message display',
              accessedBy: userId,
              timestamp: new Date()
            });
            isPHIProtected = true;
          }
        }
        
        processed.push({
          ...msg,
          displayContent,
          isPHIProtected
        });
      }
      
      setProcessedMessages(processed);
    };
    
    processMessages();
  }, [messages, sessionId, userId, onAddMessage]);

  const handleCloseCrisisAlert = () => {
    setShowCrisisAlert(false);
    setCrisisResource(null);
  };

  return (
    <>
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>Consultation Chat</h3>
          <div style={styles.securityBadge}>
            <span style={styles.badgeSpan}>🔒 HIPAA Compliant</span>
            <span style={styles.badgeSpan}>🛡️ End-to-End Encrypted</span>
          </div>
        </div>
        
        <div style={styles.messagesContainer}>
          {/* Triage Urgency Banner */}
          {triageResult && triageResult.score && (
            <div style={{
              ...styles.urgencyBanner,
              backgroundColor: getUrgencyColor(triageResult.colorCode || 'green').bg,
            }}>
              <div style={styles.urgencyIcon}>{getUrgencyColor(triageResult.colorCode || 'green').icon}</div>
              <div style={styles.urgencyContent}>
                <div style={styles.urgencyTitle}>
                  {getUrgencyDisplay(triageResult.urgencyLevel)}
                </div>
                <div style={styles.urgencyScore}>Urgency Score: {triageResult.score}/100</div>
                <div style={styles.urgencyRecommendation}>
                  {triageResult.recommendation || 'Monitor your symptoms'}
                </div>
              </div>
            </div>
          )}
          
          {/* Regular messages */}
          {processedMessages.map((message, index) => (
            <div
              key={message.id || index}
              style={{
                ...styles.message,
                ...(message.type === 'user' ? styles.userMessage : styles.aiMessage),
              }}
            >
              <div style={styles.messageHeader}>
                <div style={styles.messageSender}>
                  <strong>{message.type === 'user' ? 'You' : 'AI Doctor'}</strong>
                  {message.isPHIProtected && (
                    <span style={styles.phiBadge}>🔒 PHI Protected</span>
                  )}
                  {message.type === 'ai' && (
                    <span style={styles.aiBadge}>🤖 AI Response</span>
                  )}
                </div>
                <small>
                  {message.timestamp instanceof Date 
                    ? message.timestamp.toLocaleTimeString() 
                    : new Date(message.timestamp).toLocaleTimeString()}
                </small>
              </div>
              <div style={styles.messageContent}>
                {message.translation ? (
                  <>
                    <p style={{ margin: 0 }}>
                      {expandedTranslations[message.id] ? message.translation : message.content}
                    </p>
                    <button
                      onClick={() => toggleTranslation(message.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: message.type === 'user' ? '#f3f4f6' : '#60a5fa',
                        cursor: 'pointer',
                        fontSize: '11px',
                        padding: '4px 0 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        textDecoration: 'underline',
                        marginTop: '4px'
                      }}
                    >
                      🌐 {expandedTranslations[message.id] ? 'Show Original' : 'Show Translation'}
                    </button>
                  </>
                ) : (
                  message.displayContent
                )}
              </div>
            </div>
          ))}
          
          {/* Streaming message (real-time typing effect) */}
          {isStreaming && streamingMessage && (
            <div style={styles.streamingMessage}>
              <div style={styles.messageHeader}>
                <div style={styles.messageSender}>
                  <strong>AI Doctor</strong>
                  <span style={styles.typingBadge}>typing...</span>
                </div>
              </div>
              <div style={styles.messageContent}>
                {streamingMessage}
                <span className="cursor-blink">|</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {showCrisisAlert && crisisResource && (
        <CrisisAlert
          crisisType={crisisResource.type || 'crisis'}
          resource={crisisResource}
          onClose={handleCloseCrisisAlert}
        />
      )}
    </>
  );
}

const styles = {
  container: {
    marginTop: '30px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: '15px',
    flexWrap: 'wrap' as const,
    gap: '10px',
  },
  title: {
    fontSize: '20px',
    margin: 0,
    color: 'var(--text-primary)',
  },
  securityBadge: {
    display: 'flex',
    gap: '12px',
    fontSize: '11px',
  },
  badgeSpan: {
    padding: '4px 8px',
    borderRadius: '12px',
    background: '#fef3c7',
    color: '#92400e',
  },
  messagesContainer: {
    maxHeight: '450px',
    overflowY: 'auto' as const,
    padding: '15px',
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
  },
  urgencyBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '20px',
    color: 'white',
    flexWrap: 'wrap' as const,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  urgencyIcon: {
    fontSize: '32px',
  },
  urgencyContent: {
    flex: 1,
  },
  urgencyTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  urgencyScore: {
    fontSize: '13px',
    opacity: 0.9,
    marginBottom: '4px',
  },
  urgencyRecommendation: {
    fontSize: '13px',
    opacity: 0.85,
  },
  message: {
    marginBottom: '16px',
    padding: '14px',
    borderRadius: '12px',
    maxWidth: '85%',
    animation: 'slideIn 0.3s ease',
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
  streamingMessage: {
    marginBottom: '16px',
    padding: '14px',
    borderRadius: '12px',
    maxWidth: '85%',
    background: '#1e293b',
    color: '#f1f5f9',
    border: '1px solid #334155',
    textAlign: 'left' as const,
    marginRight: 'auto',
    animation: 'slideIn 0.3s ease',
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '11px',
    opacity: 0.8,
    flexWrap: 'wrap' as const,
    gap: '8px',
  },
  messageSender: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
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
  phiBadge: {
    fontSize: '10px',
    padding: '2px 6px',
    background: '#fef3c7',
    color: '#92400e',
    borderRadius: '4px',
    marginLeft: '8px',
  },
  aiBadge: {
    fontSize: '10px',
    padding: '2px 6px',
    background: '#334155',
    color: '#94a3b8',
    borderRadius: '4px',
    marginLeft: '8px',
  },
  typingBadge: {
    fontSize: '10px',
    padding: '2px 8px',
    background: '#22c55e',
    color: 'white',
    borderRadius: '12px',
    marginLeft: '8px',
    animation: 'pulse 1.5s infinite',
  },
};

// Add animation styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  .cursor-blink {
    animation: blink 1s infinite;
    display: inline-block;
    width: 2px;
    margin-left: 2px;
  }
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`;
if (!document.head.querySelector('#chat-messages-styles')) {
  styleSheet.id = 'chat-messages-styles';
  document.head.appendChild(styleSheet);
}