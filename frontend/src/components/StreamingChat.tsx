import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '@clerk/clerk-react';
import { BACKEND_URL, API_URL } from '../config/api';

interface StreamingChatProps {
  consultationId: string;
  specialistType: string;
  userId: string;
  onMessageUpdate?: (message: string, isComplete: boolean) => void;
}

export default function StreamingChat({ consultationId, specialistType, userId, onMessageUpdate }: StreamingChatProps) {
  const { getToken } = useAuth();
  const [isReceivingStream, setIsReceivingStream] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const socketRef = useRef<any>(null);
  const [contextPrompt, setContextPrompt] = useState('');

  // Load conversation context
  useEffect(() => {
    const loadContext = async () => {
      try {
        const response = await fetch(`${API_URL}/conversation/previous-symptoms/${userId}`);
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          const context = `\n\n[Previous consultations] You previously reported: ${data.data.slice(0, 3).join(', ')}. Consider this history.`;
          setContextPrompt(context);
        }
      } catch (error) {
        console.error('Error loading context:', error);
      }
    };
    
    if (userId) {
      loadContext();
    }
  }, [userId]);

  // WebSocket connection
  useEffect(() => {
    socketRef.current = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      auth: (cb) => {
        getToken()
          .then((token) => cb({ token }))
          .catch((err) => {
            console.error('Failed to get Clerk token for Socket.IO:', err);
            cb({ token: null });
          });
      }
    });
    
    socketRef.current.on('connect', () => {
      console.log('✅ Streaming WebSocket connected');
      setConnectionStatus('Connected');
      socketRef.current.emit('join-consultation', consultationId);
    });
    
    socketRef.current.on('connect_error', (error: any) => {
      console.error('WebSocket error:', error);
      if (error.message && (error.message.includes('Authentication') || error.message.includes('Token') || error.message.includes('auth'))) {
        setConnectionStatus('Authentication Failed');
      } else {
        setConnectionStatus('Connection failed');
      }
    });
    
    socketRef.current.on('ai-response-chunk', (data: any) => {
      if (data.isComplete) {
        setIsReceivingStream(false);
        setStreamingResponse('');
        if (onMessageUpdate) {
          onMessageUpdate(data.fullResponse, true);
        }
      } else if (data.chunk) {
        setIsReceivingStream(true);
        setStreamingResponse(prev => prev + data.chunk);
        if (onMessageUpdate) {
          onMessageUpdate(data.chunk, false);
        }
      }
    });
    
    socketRef.current.on('ai-response-error', (data: any) => {
      console.error('Stream error:', data.error);
      setIsReceivingStream(false);
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [consultationId]);

  const sendStreamingMessage = (message: string) => {
    if (!message.trim()) return;
    
    setStreamingResponse('');
    setIsReceivingStream(true);
    
    socketRef.current.emit('get-ai-response-stream', {
      consultationId,
      transcript: message,
      specialistType,
      userId,
      contextPrompt: contextPrompt || undefined,
    });
  };

  return {
    sendStreamingMessage,
    isReceivingStream,
    streamingResponse,
    connectionStatus,
  };
}

// Add a typed message component for streaming
export function StreamingMessage({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  return (
    <div style={{
      background: '#1e293b',
      color: '#f1f5f9',
      padding: '14px',
      borderRadius: '12px',
      marginBottom: '16px',
      maxWidth: '85%',
      marginRight: 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <strong>🤖 AI Doctor</strong>
        {isStreaming && (
          <span style={{
            fontSize: '11px',
            color: '#22c55e',
            background: 'rgba(34,197,94,0.2)',
            padding: '2px 8px',
            borderRadius: '12px',
          }}>
            Typing...
          </span>
        )}
      </div>
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
        {text}
        {isStreaming && (
          <span className="cursor-blink" style={{
            display: 'inline-block',
            width: '2px',
            height: '16px',
            background: '#22c55e',
            marginLeft: '2px',
            animation: 'blink 1s infinite',
          }} />
        )}
      </div>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}