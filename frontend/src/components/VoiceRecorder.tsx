import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

interface Props {
  consultationId: string;
  specialistType: string;
  onTranscriptUpdate: (transcript: string) => void;
  onAIResponse: (response: string) => void;
}

export default function VoiceRecorder({ consultationId, specialistType, onTranscriptUpdate, onAIResponse }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualText, setManualText] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [useTextInput, setUseTextInput] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const socketRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');

  // Voice settings
  const [voiceSettings, setVoiceSettings] = useState(() => {
    const saved = localStorage.getItem('voiceSettings');
    return saved ? JSON.parse(saved) : { enabled: true, voice: 'default', rate: 1, pitch: 1, volume: 1, autoSpeak: true };
  });

  // Speak function using voice settings
  const speakResponse = (text: string) => {
    if (!voiceSettings.enabled || !window.speechSynthesis) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;
    
    // Try to set voice based on selection
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
          sendToAI(finalTranscriptRef.current);
        }
      };
      
      setRecognition(recognitionInstance);
    } else {
      console.log('Web Speech API not supported');
      setUseTextInput(true);
    }
  }, []);

  const sendToAI = (text: string) => {
    if (text.trim()) {
      console.log('📤 Sending to AI:', text);
      onTranscriptUpdate(text);
      setIsProcessing(true);
      
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('get-ai-response', {
          consultationId,
          transcript: text,
          specialistType
        });
      } else {
        setTimeout(() => {
          const mockResponse = getMockResponse(text, specialistType);
          onAIResponse(mockResponse);
          if (voiceSettings.autoSpeak && voiceSettings.enabled) {
            speakResponse(mockResponse);
          }
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    console.log('🔌 Connecting to WebSocket server...');
    socketRef.current = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5
    });
    
    socketRef.current.on('connect', () => {
      console.log('✅ Connected to voice server');
      setConnectionStatus('Connected');
      socketRef.current.emit('join-consultation', consultationId);
    });
    
    socketRef.current.on('connect_error', (error: any) => {
      console.error('❌ WebSocket connection error:', error);
      setConnectionStatus('Connection failed');
    });
    
    socketRef.current.on('ai-response', (data: any) => {
      console.log('🤖 AI Response received:', data);
      if (data.response) {
        onAIResponse(data.response);
        if (voiceSettings.autoSpeak && voiceSettings.enabled) {
          speakResponse(data.response);
        }
      }
      setIsProcessing(false);
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [consultationId]);

  const startVoiceRecording = () => {
    if (recognition) {
      setTranscript('');
      finalTranscriptRef.current = '';
      recognition.start();
      setIsRecording(true);
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
      setTranscript(manualText);
      onTranscriptUpdate(manualText);
      sendToAI(manualText);
      setManualText('');
    }
  };

  const getMockResponse = (symptoms: string, specialist: string) => {
    const responses: Record<string, string> = {
      general: `Thank you for sharing: "${symptoms}". As your General Physician, I recommend: 
1️⃣ Get plenty of rest (7-8 hours)
2️⃣ Stay hydrated with warm fluids
3️⃣ Take over-the-counter medication if needed
4️⃣ Monitor your temperature every 4-6 hours

⚠️ If symptoms persist beyond 3 days, please consult a doctor in person.`,
      
      orthopedic: `Thank you for describing: "${symptoms}". As your Orthopedic Specialist, I recommend:
1️⃣ Apply ice pack for 15-20 minutes, 3-4 times daily
2️⃣ Rest the affected area
3️⃣ Avoid strenuous activities
4️⃣ Gentle stretching exercises if not painful

⚠️ If pain persists for more than 5 days, please schedule an in-person consultation.`,
      
      cardiologist: `Thank you for sharing: "${symptoms}". As your Cardiologist, I recommend:
1️⃣ Monitor your blood pressure regularly
2️⃣ Reduce salt and caffeine intake
3️⃣ Light walking for 20 minutes daily
4️⃣ Practice stress management techniques

⚠️ If you experience chest pain or shortness of breath, seek immediate medical attention.`,
      
      neurologist: `Thank you for describing: "${symptoms}". As your Neurologist, I recommend:
1️⃣ Get 7-8 hours of sleep regularly
2️⃣ Reduce screen time, especially before bed
3️⃣ Stay hydrated with 8-10 glasses of water
4️⃣ Practice relaxation techniques like deep breathing

⚠️ If headaches worsen or you experience vision changes, consult a doctor in person.`,
      
      pediatrician: `Thank you for sharing about your child: "${symptoms}". As your Pediatrician, I recommend:
1️⃣ Ensure plenty of rest
2️⃣ Keep hydrated with fluids or electrolyte solution
3️⃣ Monitor temperature every 4 hours
4️⃣ Provide light, nutritious meals

⚠️ If fever exceeds 103°F or symptoms worsen, consult immediately.`,
    };
    return responses[specialist] || responses.general;
  };

  const mockSymptoms = [
    "I have a headache and fever for the past 2 days. My throat is sore and I feel very tired.",
    "My lower back hurts when I sit for long hours. The pain radiates to my legs.",
    "I feel chest pain when I walk fast or climb stairs. I also feel short of breath.",
    "My right knee is swollen and painful. It hurts when I bend or walk.",
    "My child has a cough and runny nose. They also have a fever of 101°F."
  ];

  return (
    <div style={styles.container}>
      <div style={styles.statusBar}>
        <span>🔌 WebSocket: </span>
        <span style={connectionStatus === 'Connected' ? styles.statusConnected : styles.statusDisconnected}>
          {connectionStatus}
        </span>
        <span style={styles.voiceStatus}>
          {voiceSettings.enabled ? '🔊 Voice ON' : '🔇 Voice OFF'}
        </span>
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
          
          {isProcessing && (
            <div style={styles.processingIndicator}>
              🤖 AI Doctor is analyzing your symptoms...
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
              disabled={!manualText.trim() || isProcessing}
            >
              {isProcessing ? '🤔 Analyzing...' : '💬 Send to AI Doctor'}
            </button>
          </div>
        </div>
      )}
    </div>
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
    marginLeft: 'auto',
    color: '#8b5cf6',
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
`;
document.head.appendChild(styleSheet);