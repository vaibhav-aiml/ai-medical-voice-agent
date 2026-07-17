import { useState, useEffect, useRef } from 'react';
import { API_URL } from '../../config/api';
import { useVoiceSocket } from '../../hooks/useVoiceSocket';

interface StreamingChatProps {
  consultationId: string;
  specialistType: string;
  userId: string;
  onMessageUpdate?: (message: string, isComplete: boolean) => void;
}

export default function StreamingChat({ consultationId, specialistType, userId, onMessageUpdate }: StreamingChatProps) {
  const { socket, connectionStatus } = useVoiceSocket(consultationId);
  const [isReceivingStream, setIsReceivingStream] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
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

  // WebSocket event listeners
  useEffect(() => {
    if (!socket) return;
    
    const handleChunk = (data: any) => {
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
    };
    
    const handleError = (data: any) => {
      console.error('Stream error:', data.error);
      setIsReceivingStream(false);
    };

    socket.on('ai-response-chunk', handleChunk);
    socket.on('ai-response-error', handleError);
    
    return () => {
      socket.off('ai-response-chunk', handleChunk);
      socket.off('ai-response-error', handleError);
    };
  }, [socket, onMessageUpdate]);

  const sendStreamingMessage = (message: string) => {
    if (!message.trim() || !socket) return;
    
    setStreamingResponse('');
    setIsReceivingStream(true);
    
    socket.emit('get-ai-response-stream', {
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