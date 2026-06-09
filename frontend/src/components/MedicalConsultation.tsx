import React, { useState, useEffect, useRef } from 'react';
import { safetyGuardrail } from '../services/safetyGuardrail';
import { auditLogger } from '../services/auditLogger';
import { hipaaCompliance } from '../services/hipaaCompliance';
import CrisisAlert from './CrisisAlert';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isAnonymized?: boolean;
}

interface ConsultationSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'ended' | 'crisis_interrupted';
}

const MedicalConsultation: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<ConsultationSession | null>(null);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [crisisResource, setCrisisResource] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const getCurrentUserId = (): string => {
    let userId = localStorage.getItem('medical_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('medical_user_id', userId);
    }
    return userId;
  };

  const getCurrentSessionId = (): string => {
    if (session) return session.sessionId;
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return sessionId;
  };

  useEffect(() => {
    const userId = getCurrentUserId();
    const sessionId = getCurrentSessionId();
    
    const newSession: ConsultationSession = {
      sessionId,
      userId,
      startTime: new Date(),
      status: 'active'
    };
    
    setSession(newSession);
    
    auditLogger.log(userId, sessionId, 'consultation_start', 'Consultation session started', {
      userAgent: navigator.userAgent
    });
    
    const welcomeMessage: Message = {
      id: `msg_${Date.now()}`,
      text: "Hello! I'm MediVoice AI, your medical consultation assistant. I'm here to help you understand your symptoms and provide general medical information.\n\n⚠️ **Important**: I'm an AI assistant, not a doctor. For medical emergencies, please call 911 immediately.\n\nHow can I help you today?",
      sender: 'ai',
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    inputRef.current?.focus();
    
    return () => {
      if (session && session.status === 'active') {
        auditLogger.log(userId, session.sessionId, 'consultation_end', 'Consultation session ended', {
          duration: Date.now() - session.startTime.getTime()
        });
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCrisisDetected = (crisisType: string, resource: any) => {
    setCrisisResource(resource);
    setShowCrisisAlert(true);
    
    if (session) {
      setSession({
        ...session,
        status: 'crisis_interrupted',
        endTime: new Date()
      });
    }
    
    const crisisMessage: Message = {
      id: `msg_${Date.now()}`,
      text: safetyGuardrail.getCrisisResponse(),
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, crisisMessage]);
  };

  const getAIResponse = async (userMessage: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const responses = [
      "Based on the symptoms you've described, it's important to stay hydrated and rest. However, please consult a healthcare provider if symptoms persist.",
      "I understand your concern. Could you provide more details about when these symptoms started?",
      "Thank you for sharing. From a general medical perspective, these symptoms could be related to several common conditions. Have you experienced any fever or fatigue?",
      "I recommend monitoring your symptoms for the next 24 hours. If they worsen, please seek medical attention promptly."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !session || session.status !== 'active') return;
    
    const userId = getCurrentUserId();
    const sessionId = session.sessionId;
    const userMessageText = inputMessage.trim();
    
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);
    
    const safetyCheck = safetyGuardrail.analyzeMessage(userMessageText);
    
    if (safetyCheck.crisisDetected) {
      auditLogger.log(userId, sessionId, 'crisis_detected', userMessageText, {
        crisisDetected: true,
        crisisType: safetyCheck.crisisType
      });
      
      const userMessage: Message = {
        id: `msg_${Date.now()}`,
        text: safetyCheck.sanitizedMessage || userMessageText,
        sender: 'user',
        timestamp: new Date(),
        isAnonymized: true
      };
      setMessages(prev => [...prev, userMessage]);
      
      handleCrisisDetected(safetyCheck.crisisType!, safetyCheck.resource);
      setIsLoading(false);
      setIsTyping(false);
      return;
    }
    
    const anonymizedMessage = hipaaCompliance.anonymizeForAI(userMessageText);
    const containsPHI = hipaaCompliance.containsPHI(userMessageText);
    
    auditLogger.log(userId, sessionId, 'message_sent', anonymizedMessage, {
      containsPHI
    });
    
    if (containsPHI) {
      hipaaCompliance.logPHIAccess({
        type: 'medical_record',
        value: anonymizedMessage,
        accessReason: 'AI consultation processing',
        accessedBy: userId,
        timestamp: new Date()
      });
    }
    
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      text: userMessageText,
      sender: 'user',
      timestamp: new Date(),
      isAnonymized: containsPHI
    };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const aiResponseText = await getAIResponse(anonymizedMessage);
      
      auditLogger.log(userId, sessionId, 'message_received', aiResponseText, {});
      
      const aiMessage: Message = {
        id: `msg_${Date.now()}`,
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      auditLogger.log(userId, sessionId, 'consultation_end', 'Error in AI response', {
        error: String(error)
      });
      
      const errorMessage: Message = {
        id: `msg_${Date.now()}`,
        text: "I'm experiencing technical difficulties. Please try again in a moment. If this persists, please contact support.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleEndConsultation = () => {
    if (session && session.status === 'active') {
      const userId = getCurrentUserId();
      
      auditLogger.log(userId, session.sessionId, 'consultation_end', 'User ended consultation', {
        duration: Date.now() - session.startTime.getTime()
      });
      
      setSession({
        ...session,
        status: 'ended',
        endTime: new Date()
      });
      
      const endMessage: Message = {
        id: `msg_${Date.now()}`,
        text: "Thank you for using MediVoice AI. Remember, this information is not a substitute for professional medical advice. Please consult a healthcare provider for any concerns. Stay healthy! 🏥",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, endMessage]);
    }
  };

  const exportTranscript = () => {
    const transcript = messages.map(msg => {
      return `[${msg.timestamp.toLocaleString()}] ${msg.sender.toUpperCase()}: ${msg.text}`;
    }).join('\n\n');
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consultation_${session?.sessionId}_${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    if (session) {
      auditLogger.log(getCurrentUserId(), session.sessionId, 'consultation_end', 'Transcript exported', {});
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="consultation-container">
      <div className="consultation-header">
        <div className="header-info">
          <h1>MediVoice AI Consultation</h1>
          <div className="session-status">
            <span className={`status-badge ${session?.status}`}>
              {session?.status === 'active' ? '🟢 Active Session' : '⚫ Session Ended'}
            </span>
            <span className="hipaa-badge">🔒 HIPAA Compliant</span>
          </div>
        </div>
        <div className="header-actions">
          {session?.status === 'active' && (
            <button onClick={handleEndConsultation} className="end-btn">
              End Consultation
            </button>
          )}
          <button onClick={exportTranscript} className="export-btn">
            Export Transcript
          </button>
        </div>
      </div>

      <div className="messages-area">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-avatar">
              {message.sender === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-text">{message.text}</div>
              <div className="message-meta">
                <span>{message.timestamp.toLocaleTimeString()}</span>
                {message.isAnonymized && (
                  <span className="anonymized-badge">🔒 PHI Protected</span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message ai">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {session?.status === 'active' && (
        <div className="input-area">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your symptoms or ask a medical question..."
            disabled={isLoading}
            rows={3}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="send-btn"
          >
            {isLoading ? 'Processing...' : 'Send'}
          </button>
        </div>
      )}

      {showCrisisAlert && crisisResource && (
        <CrisisAlert
          crisisType={crisisResource.type}
          resource={crisisResource}
          onClose={() => setShowCrisisAlert(false)}
        />
      )}

      <style>{`
        .consultation-container {
          max-width: 900px;
          margin: 0 auto;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
        }

        .consultation-header {
          background: white;
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-info h1 {
          font-size: 24px;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .session-status {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .status-badge {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 12px;
          background: #e2e8f0;
        }

        .status-badge.active {
          background: #dcfce7;
          color: #166534;
        }

        .hipaa-badge {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 12px;
          background: #fef3c7;
          color: #92400e;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .end-btn, .export-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .end-btn {
          background: #fee2e2;
          color: #dc2626;
        }

        .end-btn:hover {
          background: #dc2626;
          color: white;
        }

        .export-btn {
          background: #e0e7ff;
          color: #4f46e5;
        }

        .export-btn:hover {
          background: #4f46e5;
          color: white;
        }

        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .message {
          display: flex;
          gap: 12px;
          animation: slideIn 0.3s ease;
        }

        .message.user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .message.user .message-avatar {
          background: linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%);
        }

        .message-content {
          max-width: 70%;
          background: white;
          padding: 12px 16px;
          border-radius: 16px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .message.user .message-content {
          background: #3b82f6;
          color: white;
        }

        .message-text {
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .message-meta {
          font-size: 10px;
          margin-top: 6px;
          opacity: 0.7;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .anonymized-badge {
          font-size: 10px;
          padding: 2px 6px;
          background: #fef3c7;
          color: #92400e;
          border-radius: 4px;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px 0;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #94a3b8;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }

        .input-area {
          background: white;
          padding: 20px 24px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .input-area textarea {
          flex: 1;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-family: inherit;
          font-size: 14px;
          resize: none;
          transition: border-color 0.3s ease;
        }

        .input-area textarea:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .send-btn {
          padding: 12px 24px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .send-btn:hover:not(:disabled) {
          background: #1e3a8a;
          transform: translateY(-2px);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

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

        @media (max-width: 768px) {
          .message-content {
            max-width: 85%;
          }
          
          .consultation-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .header-actions {
            width: 100%;
          }
          
          .end-btn, .export-btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default MedicalConsultation;