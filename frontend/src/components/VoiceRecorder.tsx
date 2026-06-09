import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import TriageDisplay from './TriageDisplay';

interface Props {
  consultationId: string;
  specialistType: string;
  onTranscriptUpdate: (transcript: string) => void;
  onAIResponse: (response: string, isComplete?: boolean) => void;
  onTriageResult?: (result: any) => void;
  userId?: string;
}

interface TriageResult {
  urgencyLevel: 'routine' | 'consult_48h' | 'consult_24h' | 'emergency_immediate';
  score: number;
  recommendation: string;
  riskFactors: string[];
  suggestedAction: string;
  requiresAmbulance: boolean;
  colorCode: 'green' | 'yellow' | 'orange' | 'red';
}

export default function VoiceRecorder({ consultationId, specialistType, onTranscriptUpdate, onAIResponse, onTriageResult, userId }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualText, setManualText] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [useTextInput, setUseTextInput] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [showTriageAlert, setShowTriageAlert] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [contextPrompt, setContextPrompt] = useState('');
  const [conversationHistory, setConversationHistory] = useState<{role: string, content: string}[]>([]);
  const socketRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');
  const accumulatedResponseRef = useRef<string>('');

  // Voice settings
  const [voiceSettings, setVoiceSettings] = useState(() => {
    const saved = localStorage.getItem('voiceSettings');
    return saved ? JSON.parse(saved) : { enabled: true, voice: 'default', rate: 1, pitch: 1, volume: 1, autoSpeak: true };
  });

  // Load conversation context from previous consultations
  useEffect(() => {
    const loadContext = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch(`/api/conversation/previous-symptoms/${userId}`);
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          const previousSymptoms = data.data.slice(0, 3).join(', ');
          const context = `\n\nPreviously, you reported: ${previousSymptoms}. Please consider this history.`;
          setContextPrompt(context);
          console.log('📚 Loaded conversation context:', previousSymptoms);
        }
      } catch (error) {
        console.error('Error loading conversation context:', error);
      }
    };
    
    loadContext();
  }, [userId]);

  // Reset conversation history when consultation starts
  useEffect(() => {
    if (consultationId) {
      setConversationHistory([]);
      accumulatedResponseRef.current = '';
    }
  }, [consultationId]);

  // Speak function using voice settings
  const speakResponse = useCallback((text: string) => {
    if (!voiceSettings.enabled || !window.speechSynthesis) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;
    
    if (voiceSettings.voice !== 'default') {
      const voices = window.speechSynthesis.getVoices();
      const voiceMap: Record<string, string> = {
        'google-us-female': 'Google UK English Female',
        'google-us-male': 'Google UK English Male',
        'google-uk-female': 'Google UK English Female',
        'google-uk-male': 'Google UK English Male',
        'amazon-joanna': 'Joanna',
        'amazon-matthew': 'Matthew',
        'microsoft-jenny': 'Microsoft Jenny',
      };
      const voiceName = voiceMap[voiceSettings.voice];
      const selectedVoice = voices.find(v => v.name.includes(voiceName || ''));
      if (selectedVoice) utterance.voice = selectedVoice;
    }
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [voiceSettings.enabled, voiceSettings.rate, voiceSettings.pitch, voiceSettings.volume, voiceSettings.voice]);

  // Get AI response with streaming and conversation history
  const getAIResponseStream = (symptoms: string) => {
    if (socketRef.current && socketRef.current.connected) {
      console.log('📤 Sending streaming request to Groq AI:', symptoms);
      console.log('📚 Conversation history length:', conversationHistory.length);
      
      socketRef.current.emit('get-ai-response-stream', {
        consultationId,
        transcript: symptoms,
        specialistType,
        userId,
        contextPrompt: contextPrompt || undefined,
        conversationHistory: conversationHistory, // Send conversation history
      });
      return true;
    }
    return false;
  };

  // Analyze symptoms for triage
  const analyzeSymptomsForTriage = async (symptoms: string) => {
    setIsAnalyzing(true);
    try {
      const triageResponse = await fetch('/api/triage/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms })
      });
      const triageData = await triageResponse.json();
      
      if (triageData.success && triageData.data) {
        console.log('📊 Triage Result:', triageData.data);
        setTriageResult(triageData.data);
        
        if (onTriageResult) {
          onTriageResult(triageData.data);
        }
        
        if (triageData.data.urgencyLevel === 'emergency_immediate') {
          setShowTriageAlert(true);
        }
      }
    } catch (error) {
      console.error('Triage analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Listen for voice settings changes
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('voiceSettings');
      if (saved) setVoiceSettings(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          finalTranscriptRef.current = finalTranscript;
          setTranscript(finalTranscript);
          console.log('Final transcript:', finalTranscript);
        }
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Please allow microphone access to use voice features');
        }
      };
      
      recognitionInstance.onend = () => {
        console.log('Recognition ended');
        if (finalTranscriptRef.current && !isProcessing) {
          // Add user message to conversation history
          const userMessage = { role: 'user', content: finalTranscriptRef.current };
          setConversationHistory(prev => [...prev, userMessage]);
          
          onTranscriptUpdate(finalTranscriptRef.current);
          getAIResponseStream(finalTranscriptRef.current);
          analyzeSymptomsForTriage(finalTranscriptRef.current);
        }
      };
      
      setRecognition(recognitionInstance);
    } else {
      console.log('Web Speech API not supported');
      setUseTextInput(true);
    }
  }, []);

  // WebSocket connection with streaming support
  useEffect(() => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    
    console.log('🔌 Connecting to WebSocket at:', BACKEND_URL);
    
    socketRef.current = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000
    });
    
    socketRef.current.on('connect', () => {
      console.log('✅ WebSocket connected successfully!');
      setConnectionStatus('Connected');
      socketRef.current.emit('join-consultation', consultationId);
    });
    
    socketRef.current.on('connect_error', (error: any) => {
      console.error('❌ WebSocket connection error:', error.message);
      setConnectionStatus('Connection failed');
    });
    
    // Handle streaming responses with conversation history
    socketRef.current.on('ai-response-chunk', (data: any) => {
      if (data.isComplete) {
        console.log('✅ Streaming complete');
        setIsStreaming(false);
        
        // Add assistant response to conversation history
        const assistantMessage = { role: 'assistant', content: accumulatedResponseRef.current };
        setConversationHistory(prev => [...prev, assistantMessage]);
        
        // Send the COMPLETE accumulated response once
        onAIResponse(accumulatedResponseRef.current, true);
        accumulatedResponseRef.current = '';
        setStreamingText('');
        if (voiceSettings.autoSpeak && voiceSettings.enabled) {
          speakResponse(data.fullResponse || accumulatedResponseRef.current);
        }
        setIsProcessing(false);
      } else if (data.chunk) {
        if (!isStreaming) {
          setIsStreaming(true);
        }
        // Accumulate chunks
        accumulatedResponseRef.current += data.chunk;
        // Update preview only
        setStreamingText(accumulatedResponseRef.current);
        // Send chunk for real-time preview
        onAIResponse(data.chunk, false);
      }
    });
    
    // Handle non-streaming responses (fallback)
    socketRef.current.on('ai-response', (data: any) => {
      console.log('🤖 AI Response from Groq:', data);
      if (data.response) {
        // Add to conversation history
        setConversationHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
        onAIResponse(data.response, true);
        if (voiceSettings.autoSpeak && voiceSettings.enabled) {
          speakResponse(data.response);
        }
      }
      setIsProcessing(false);
      setIsStreaming(false);
      setStreamingText('');
      accumulatedResponseRef.current = '';
    });
    
    socketRef.current.on('ai-response-error', (error: any) => {
      console.error('Streaming error:', error);
      setIsProcessing(false);
      setIsStreaming(false);
      onAIResponse("I'm having trouble processing your request. Please try again.", true);
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [consultationId, voiceSettings.autoSpeak, voiceSettings.enabled, speakResponse]);

  const startVoiceRecording = () => {
    if (recognition) {
      setTranscript('');
      finalTranscriptRef.current = '';
      accumulatedResponseRef.current = '';
      recognition.start();
      setIsRecording(true);
      setIsProcessing(true);
      console.log('🎤 Voice recording started');
    } else {
      alert('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      setUseTextInput(true);
    }
  };

  const stopVoiceRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
      console.log('🛑 Voice recording stopped');
    }
  };

  const sendTextMessage = () => {
    if (manualText.trim()) {
      console.log('📤 Sending text message:', manualText);
      
      // Add user message to conversation history
      const userMessage = { role: 'user', content: manualText };
      setConversationHistory(prev => [...prev, userMessage]);
      
      setTranscript(manualText);
      onTranscriptUpdate(manualText);
      accumulatedResponseRef.current = '';
      getAIResponseStream(manualText);
      analyzeSymptomsForTriage(manualText);
      setManualText('');
    }
  };

  const mockSymptoms = [
    "I have a headache and fever for the past 2 days. My throat is sore and I feel very tired.",
    "My lower back hurts when I sit for long hours. The pain radiates to my legs.",
    "I feel chest pain when I walk fast or climb stairs. I also feel short of breath.",
    "My right knee is swollen and painful. It hurts when I bend or walk.",
    "My child has a cough and runny nose. They also have a fever of 101°F."
  ];

  return (
    <>
      <div style={styles.container}>
        <div style={styles.statusBar}>
          <span>🔌 WebSocket: </span>
          <span style={connectionStatus === 'Connected' ? styles.statusConnected : styles.statusDisconnected}>
            {connectionStatus}
          </span>
          <span style={styles.voiceStatus}>
            {voiceSettings.enabled ? '🔊 Voice ON' : '🔇 Voice OFF'}
          </span>
          {contextPrompt && (
            <span style={styles.contextBadge}>
              📚 Context Loaded
            </span>
          )}
          {conversationHistory.length > 0 && (
            <span style={styles.historyBadge}>
              💬 {Math.floor(conversationHistory.length / 2)} exchanges
            </span>
          )}
        </div>
        
        <div style={styles.modeSelector}>
          <button 
            onClick={() => setUseTextInput(false)} 
            style={{...styles.modeButton, ...(!useTextInput ? styles.activeMode : {})}}
          >
            🎤 Voice Mode
          </button>
          <button 
            onClick={() => setUseTextInput(true)} 
            style={{...styles.modeButton, ...(useTextInput ? styles.activeMode : {})}}
          >
            ✏️ Text Mode
          </button>
        </div>
        
        {!useTextInput ? (
          <div style={styles.voiceSection}>
            <div style={styles.voiceInstructions}>
              <p>🎤 Click "Start Speaking" and say your symptoms clearly</p>
              <p style={styles.tip}>💡 Tip: Speak slowly and clearly for best results</p>
              {voiceSettings.enabled && (
                <p style={styles.voiceTip}>🔊 AI will speak responses aloud</p>
              )}
              {contextPrompt && (
                <p style={styles.contextTip}>📚 AI remembers your previous consultations</p>
              )}
            </div>
            
            {!isRecording ? (
              <button onClick={startVoiceRecording} style={styles.recordButton}>
                🎤 Start Speaking
              </button>
            ) : (
              <button onClick={stopVoiceRecording} style={styles.stopButton}>
                ⏹️ Stop Recording
              </button>
            )}
            
            {isRecording && (
              <div style={styles.recordingIndicator}>
                <span style={styles.redDot}></span>
                Recording... Speak clearly!
              </div>
            )}
            
            {transcript && !isRecording && (
              <div style={styles.transcriptPreview}>
                <strong>You said:</strong>
                <p>{transcript}</p>
              </div>
            )}
            
            {(isProcessing || isAnalyzing || isStreaming) && (
              <div style={styles.processingIndicator}>
                {isStreaming ? (
                  <div style={styles.streamingIndicator}>
                    <div className="typing-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <span>AI is responding in real-time...</span>
                  </div>
                ) : isAnalyzing ? (
                  '📊 Checking urgency level...'
                ) : (
                  '🤖 AI Doctor is analyzing your symptoms...'
                )}
              </div>
            )}
            
            {isStreaming && streamingText && (
              <div style={styles.streamingPreview}>
                <strong>🤖 AI is typing:</strong>
                <p>{streamingText}<span className="cursor-blink">|</span></p>
              </div>
            )}
          </div>
        ) : (
          <div style={styles.textInputSection}>
            <h4>Describe your symptoms in detail:</h4>
            <textarea
              style={styles.textArea}
              placeholder="Example: I have a headache and fever for the past 2 days. My throat is sore and I feel very tired."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              rows={4}
            />
            <div style={styles.buttonGroup}>
              <button 
                onClick={() => {
                  const random = mockSymptoms[Math.floor(Math.random() * mockSymptoms.length)];
                  setManualText(random);
                }} 
                style={styles.mockButton}
              >
                📋 Example Symptom
              </button>
              <button 
                onClick={sendTextMessage}
                style={styles.sendButton}
                disabled={!manualText.trim() || isProcessing || isAnalyzing}
              >
                {isProcessing ? '🤔 Processing...' : '💬 Send to AI Doctor'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Triage Alert Modal */}
      {showTriageAlert && triageResult && (
        <TriageDisplay
          result={triageResult}
          onClose={() => setShowTriageAlert(false)}
        />
      )}
    </>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  statusBar: {
    padding: '8px 12px',
    background: '#f0f0f0',
    borderRadius: '5px',
    fontSize: '12px',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  statusConnected: {
    color: 'green',
    fontWeight: 'bold',
  },
  statusDisconnected: {
    color: 'red',
    fontWeight: 'bold',
  },
  voiceStatus: {
    color: '#8b5cf6',
    fontWeight: 'bold',
  },
  contextBadge: {
    background: '#e0e7ff',
    color: '#4f46e5',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: 'bold',
  },
  historyBadge: {
    background: '#dcfce7',
    color: '#166534',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: 'bold',
  },
  modeSelector: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  modeButton: {
    padding: '10px 20px',
    border: '2px solid #667eea',
    background: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  activeMode: {
    background: '#667eea',
    color: 'white',
  },
  voiceSection: {
    textAlign: 'center' as const,
  },
  voiceInstructions: {
    marginBottom: '20px',
    color: '#666',
  },
  tip: {
    fontSize: '12px',
    color: '#999',
  },
  voiceTip: {
    fontSize: '12px',
    color: '#8b5cf6',
    marginTop: '5px',
  },
  contextTip: {
    fontSize: '12px',
    color: '#4f46e5',
    marginTop: '5px',
  },
  recordButton: {
    padding: '15px 30px',
    fontSize: '18px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  stopButton: {
    padding: '15px 30px',
    fontSize: '18px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  recordingIndicator: {
    marginTop: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    color: '#dc3545',
  },
  redDot: {
    width: '10px',
    height: '10px',
    backgroundColor: '#dc3545',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'blink 1s infinite',
  },
  transcriptPreview: {
    marginTop: '20px',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px',
    textAlign: 'left' as const,
  },
  processingIndicator: {
    marginTop: '15px',
    textAlign: 'center' as const,
    padding: '12px',
    background: '#e3f2fd',
    borderRadius: '8px',
    color: '#1976d2',
    fontWeight: 'bold',
  },
  streamingIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  streamingPreview: {
    marginTop: '15px',
    padding: '15px',
    background: '#e0e7ff',
    borderRadius: '8px',
    textAlign: 'left' as const,
    color: '#4f46e5',
  },
  textInputSection: {
    textAlign: 'center' as const,
  },
  textArea: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
    marginTop: '10px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
    justifyContent: 'center',
  },
  mockButton: {
    padding: '10px 20px',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  sendButton: {
    padding: '10px 20px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

// Add animation CSS
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0; }
    100% { opacity: 1; }
  }
  
  .typing-dots {
    display: inline-flex;
    gap: 4px;
  }
  
  .typing-dots span {
    width: 6px;
    height: 6px;
    background-color: #1976d2;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;
  }
  
  .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
  .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
  
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
  
  .cursor-blink {
    animation: blinkCursor 1s infinite;
  }
  
  @keyframes blinkCursor {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`;
if (!document.head.querySelector('#voice-recorder-styles')) {
  styleSheet.id = 'voice-recorder-styles';
  document.head.appendChild(styleSheet);
}