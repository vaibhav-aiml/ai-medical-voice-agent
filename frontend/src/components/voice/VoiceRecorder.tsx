import { useState, useEffect, useRef, useCallback } from 'react';
import { API_URL } from '../../config/api';
import { useVoiceSocket } from '../../hooks/useVoiceSocket';
import TriageDisplay from '../consultation/TriageDisplay';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  consultationId: string;
  specialistType: string;
  onTranscriptUpdate: (transcript: string) => void;
  onAIResponse: (response: string, isComplete?: boolean) => void;
  onTriageResult?: (result: any) => void;
  userId?: string;
  initialHistory?: Array<{role: string, content: string}>;
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

// Map language to speech recognition code
const getSpeechRecognitionCode = (language: string): string => {
  const langMap: Record<string, string> = {
    en: 'en-US',
    hi: 'hi-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    bn: 'bn-IN',
    mr: 'mr-IN',
    gu: 'gu-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    pa: 'pa-IN',
  };
  return langMap[language] || 'en-US';
};

const getEmotionEmoji = (emotion: string): string => {
  const emojiMap: Record<string, string> = {
    stress: '😰',
    anxiety: '😟',
    happiness: '😊',
    sadness: '😢',
    anger: '😠',
    fear: '😨',
    neutral: '😐',
  };
  return emojiMap[emotion] || '😐';
};

const getEmotionColor = (emotion: string): string => {
  const colorMap: Record<string, string> = {
    stress: '#f59e0b', // orange
    anxiety: '#8b5cf6', // purple
    happiness: '#10b981', // green
    sadness: '#3b82f6', // blue
    anger: '#ef4444', // red
    fear: '#ec4899', // pink
    neutral: '#6b7280', // gray
  };
  return colorMap[emotion] || '#6b7280';
};

export default function VoiceRecorder({ consultationId, specialistType, onTranscriptUpdate, onAIResponse, onTriageResult, userId, initialHistory }: Props) {
  const { language, t } = useLanguage();
  const { socket, connectionStatus } = useVoiceSocket(consultationId);

  // Stabilize callbacks to prevent socket listener re-registrations on every render cycle
  const onAIResponseRef = useRef(onAIResponse);
  const tRef = useRef(t);
  useEffect(() => {
    onAIResponseRef.current = onAIResponse;
    tRef.current = t;
  }, [onAIResponse, t]);

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualText, setManualText] = useState('');
  const [useTextInput, setUseTextInput] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [showTriageAlert, setShowTriageAlert] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [contextPrompt, setContextPrompt] = useState('');
  const [conversationHistory, setConversationHistory] = useState<{role: string, content: string}[]>(() => initialHistory || []);
  const finalTranscriptRef = useRef<string>('');
  const accumulatedResponseRef = useRef<string>('');
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);
  const [emotionConfidence, setEmotionConfidence] = useState<number | null>(null);
  const [biometricStatus, setBiometricStatus] = useState<string>(''); // '', 'verified', 'mismatch', 'unregistered'
  
  // Sync history when resuming
  useEffect(() => {
    if (initialHistory && initialHistory.length > 0) {
      setConversationHistory(initialHistory);
    }
  }, [initialHistory]);

  // Ref to track isProcessing state dynamically inside callbacks without stale closures
  const isProcessingRef = useRef(isProcessing);
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);
  const [biometricConfidence, setBiometricConfidence] = useState<number>(0);
  const verifyRecorderRef = useRef<MediaRecorder | null>(null);
  const verifyChunksRef = useRef<Blob[]>([]);
  const [noiseCancellationEnabled, setNoiseCancellationEnabled] = useState(() => {
    const saved = localStorage.getItem('noiseCancellationEnabled');
    return saved !== 'false'; // default true
  });

  const getCleanAudioStream = (rawStream: MediaStream): MediaStream => {
    if (!noiseCancellationEnabled) return rawStream;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported in this browser');
        return rawStream;
      }

      const audioCtx = new AudioContextClass();
      const source = audioCtx.createMediaStreamSource(rawStream);

      // 1. Highpass filter (cuts off frequencies below 100Hz: AC mains, rumbling)
      const hpFilter = audioCtx.createBiquadFilter();
      hpFilter.type = 'highpass';
      hpFilter.frequency.value = 100;

      // 2. Lowpass filter (cuts off frequencies above 3000Hz: high static hiss)
      const lpFilter = audioCtx.createBiquadFilter();
      lpFilter.type = 'lowpass';
      lpFilter.frequency.value = 3000;

      // Connect filters in series
      const destination = audioCtx.createMediaStreamDestination();
      source.connect(hpFilter);
      hpFilter.connect(lpFilter);
      lpFilter.connect(destination);

      console.log('🔇 Real-time Web Audio DSP noise filters successfully activated (100Hz-3kHz)');
      return destination.stream;
    } catch (err) {
      console.warn('Failed to build Web Audio DSP pipeline, falling back to raw stream:', err);
      return rawStream;
    }
  };

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
        const response = await fetch(`${API_URL}/conversation/previous-symptoms/${userId}`);
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

  // Refs to sync voiceSettings and speakResponse callback to prevent socket recreation
  const voiceSettingsRef = useRef(voiceSettings);
  const speakResponseRef = useRef(speakResponse);

  useEffect(() => {
    voiceSettingsRef.current = voiceSettings;
    speakResponseRef.current = speakResponse;
  }, [voiceSettings, speakResponse]);

  // Get AI response with streaming and conversation history
  const getAIResponseStream = (symptoms: string) => {
    if (socket && socket.connected) {
      console.log('📤 Sending streaming request to Groq AI:', symptoms);
      console.log('📚 Conversation history length:', conversationHistory.length);
      
      socket.emit('get-ai-response-stream', {
        consultationId,
        transcript: symptoms,
        specialistType,
        userId,
        contextPrompt: contextPrompt || undefined,
        conversationHistory: conversationHistory,
        language: language,
      });
      return true;
    }
    return false;
  };

  // Analyze symptoms for triage
  const analyzeSymptomsForTriage = async (symptoms: string) => {
    setIsAnalyzing(true);
    try {
      const triageResponse = await fetch(`${API_URL}/triage/analyze`, {
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

  // Initialize speech recognition with multi-language support
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      
      // Set language based on selected language
      const speechLang = getSpeechRecognitionCode(language);
      recognitionInstance.lang = speechLang;
      console.log(`🎤 Speech recognition language set to: ${speechLang} (${language})`);
      
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
          alert(t('errors.microphone'));
        }
      };
      
      recognitionInstance.onend = () => {
        console.log('Recognition ended');
        setIsRecording(false);
        if (finalTranscriptRef.current && !isProcessingRef.current) {
          const userMessage = { role: 'user', content: finalTranscriptRef.current };
          setConversationHistory(prev => [...prev, userMessage]);
          
          onTranscriptUpdate(finalTranscriptRef.current);
          setIsProcessing(true);
          const sent = getAIResponseStream(finalTranscriptRef.current);
          if (!sent) {
            console.error('Failed to send streaming request via socket - socket disconnected');
            setIsProcessing(false);
            onAIResponse('WebSocket connection is not active. Please wait or refresh.', true);
          }
          analyzeSymptomsForTriage(finalTranscriptRef.current);
        }
      };
      
      setRecognition(recognitionInstance);
    } else {
      console.log('Web Speech API not supported');
      setUseTextInput(true);
    }
  }, [language]);

  // WebSocket event listeners
  useEffect(() => {
    if (!socket) return;
    
    const handleChunk = (data: any) => {
      if (data.isComplete) {
        console.log('✅ Streaming complete');
        setIsStreaming(false);
        
        const assistantMessage = { role: 'assistant', content: accumulatedResponseRef.current };
        setConversationHistory(prev => [...prev, assistantMessage]);
        
        onAIResponseRef.current(accumulatedResponseRef.current, true);
        accumulatedResponseRef.current = '';
        setStreamingText('');
        if (voiceSettingsRef.current.autoSpeak && voiceSettingsRef.current.enabled) {
          try {
            speakResponseRef.current(data.fullResponse || accumulatedResponseRef.current);
          } catch (speechErr) {
            console.error('Speech synthesis error:', speechErr);
          }
        }
        setIsProcessing(false);
      } else if (data.chunk) {
        if (!isStreaming) {
          setIsStreaming(true);
        }
        accumulatedResponseRef.current += data.chunk;
        setStreamingText(accumulatedResponseRef.current);
        onAIResponseRef.current(data.chunk, false);
      }
    };
    
    const handleResponse = (data: any) => {
      console.log('🤖 AI Response from Groq:', data);
      if (data.response) {
        setConversationHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
        onAIResponseRef.current(data.response, true);
        if (voiceSettingsRef.current.autoSpeak && voiceSettingsRef.current.enabled) {
          try {
            speakResponseRef.current(data.response);
          } catch (speechErr) {
            console.error('Speech synthesis error:', speechErr);
          }
        }
      }
      setIsProcessing(false);
      setIsStreaming(false);
      setStreamingText('');
      accumulatedResponseRef.current = '';
    };
    
    const handleResponseError = (error: any) => {
      console.error('Streaming error:', error);
      setIsProcessing(false);
      setIsStreaming(false);
      onAIResponseRef.current(tRef.current('errors.server') || 'Server error. Please try again.', true);
    };
    
    const handleErrorEvent = (data: any) => {
      console.error('❌ Server error event:', data.message);
      setIsProcessing(false);
      setIsStreaming(false);
      onAIResponseRef.current(data.message || tRef.current('errors.server') || 'Server error. Please try again.', true);
    };

    const handleRateLimit = (data: any) => {
      console.error('❌ Server rate limit exceeded:', data.message);
      setIsProcessing(false);
      setIsStreaming(false);
      onAIResponseRef.current(data.message || 'Rate limit exceeded. Please try again later.', true);
    };

    const handleEmotion = (data: any) => {
      console.log('🎭 Emotion detected:', data);
      if (data.emotion) {
        setDetectedEmotion(data.emotion);
        setEmotionConfidence(data.confidence);
      }
    };

    socket.on('ai-response-chunk', handleChunk);
    socket.on('ai-response', handleResponse);
    socket.on('ai-response-error', handleResponseError);
    socket.on('error-event', handleErrorEvent);
    socket.on('rate-limit-exceeded', handleRateLimit);
    socket.on('emotion-detected', handleEmotion);
    
    return () => {
      socket.off('ai-response-chunk', handleChunk);
      socket.off('ai-response', handleResponse);
      socket.off('ai-response-error', handleResponseError);
      socket.off('error-event', handleErrorEvent);
      socket.off('rate-limit-exceeded', handleRateLimit);
      socket.off('emotion-detected', handleEmotion);
    };
  }, [socket]);

  const startVerificationRecording = async () => {
    verifyChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const cleanStream = getCleanAudioStream(stream);
      const mediaRecorder = new MediaRecorder(cleanStream);
      verifyRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          verifyChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(verifyChunksRef.current, { type: 'audio/wav' });
        stream.getTracks().forEach((track) => track.stop());

        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            const response = await fetch(`${API_URL}/voice/biometrics/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId,
                audio: base64Audio,
              }),
            });
            const data = await response.json();
            if (response.ok && data.success) {
              setBiometricStatus(data.isMatch ? 'verified' : 'mismatch');
              setBiometricConfidence(data.confidence);
            } else if (response.status === 400 && data.message.includes('No enrolled voice signature')) {
              setBiometricStatus('unregistered');
              setBiometricConfidence(0);
            }
          };
        } catch (verifErr) {
          console.error('Biometrics verify error:', verifErr);
        }
      };

      mediaRecorder.start();

      // Record first 3 seconds of speaker input for verification
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      }, 3000);
    } catch (err) {
      console.warn('Failed to start biometric verification recording:', err);
    }
  };

  const startVoiceRecording = () => {
    if (recognition) {
      setTranscript('');
      finalTranscriptRef.current = '';
      accumulatedResponseRef.current = '';
      recognition.start();
      setIsRecording(true);
      console.log('🎤 Voice recording started');
      
      // Start recording verification audio sample concurrently
      startVerificationRecording();
    } else {
      alert(t('errors.microphone'));
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
      
      const userMessage = { role: 'user', content: manualText };
      setConversationHistory(prev => [...prev, userMessage]);
      
      setTranscript(manualText);
      onTranscriptUpdate(manualText);
      accumulatedResponseRef.current = '';
      setIsProcessing(true);
      const sent = getAIResponseStream(manualText);
      if (!sent) {
        console.error('Failed to send text request via socket - socket disconnected');
        setIsProcessing(false);
        onAIResponse('WebSocket connection is not active. Please wait or refresh.', true);
      }
      analyzeSymptomsForTriage(manualText);
      setManualText('');
    }
  };

  const mockSymptoms = [
    t('symptoms.example'),
    "My lower back hurts when I sit for long hours. The pain radiates to my legs.",
    "I feel chest pain when I walk fast or climb stairs. I also feel short of breath.",
    "My right knee is swollen and painful. It hurts when I bend or walk.",
    "My child has a cough and runny nose. They also have a fever of 101°F."
  ];

  return (
    <>
      <div style={styles.container}>
        {((connectionStatus !== 'Connected' && connectionStatus !== 'Connecting...') || (socket && !socket.connected && connectionStatus !== 'Connecting...')) && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '12px',
            color: '#991b1b',
            fontSize: '13px',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 500
          }}>
            ⚠️ WebSocket is currently inactive: <strong>{connectionStatus}</strong> (Socket connected: {socket && socket.connected ? 'Yes' : 'No'}). Please wait or refresh.
          </div>
        )}
        <div style={styles.statusBar}>
          <span>🔌 {t('consultation.websocket')}: </span>
          <span style={
            connectionStatus === 'Connected'
              ? styles.statusConnected
              : connectionStatus === 'Authentication Failed'
              ? styles.statusAuthFailed
              : styles.statusDisconnected
          }>
            {connectionStatus === 'Connected'
              ? t('consultation.connected')
              : connectionStatus === 'Authentication Failed'
              ? 'Authentication Failed'
              : t('consultation.disconnected')}
          </span>
          <span style={styles.voiceStatus}>
            {voiceSettings.enabled ? t('consultation.voiceOn') : t('consultation.voiceOff')}
          </span>
          {contextPrompt && (
            <span style={styles.contextBadge}>
              📚 {t('consultation.contextLoaded')}
            </span>
          )}
          {conversationHistory.length > 0 && (
            <span style={styles.historyBadge}>
              💬 {Math.floor(conversationHistory.length / 2)} exchanges
            </span>
          )}
          {detectedEmotion && (
            <span style={{
              backgroundColor: getEmotionColor(detectedEmotion),
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              🎭 {getEmotionEmoji(detectedEmotion)} {detectedEmotion.toUpperCase()} {emotionConfidence ? `(${Math.round(emotionConfidence * 100)}%)` : ''}
            </span>
          )}
          {biometricStatus && (
            <span style={{
              backgroundColor: biometricStatus === 'verified' ? '#10b981' : biometricStatus === 'mismatch' ? '#ef4444' : '#6b7280',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              👤 {biometricStatus === 'verified' ? `VERIFIED (${Math.round(biometricConfidence * 100)}%)` : biometricStatus === 'mismatch' ? 'MISMATCHED VOICE' : 'UNREGISTERED VOICE'}
            </span>
          )}
          <button
            onClick={() => {
              const newVal = !noiseCancellationEnabled;
              setNoiseCancellationEnabled(newVal);
              localStorage.setItem('noiseCancellationEnabled', newVal.toString());
            }}
            style={{
              backgroundColor: noiseCancellationEnabled ? '#1e3a8a' : '#374151',
              color: 'white',
              border: 'none',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            🔇 Noise Cancellation: {noiseCancellationEnabled ? 'ON (100Hz-3kHz)' : 'OFF'}
          </button>
        </div>
        
        <div style={styles.modeSelector}>
          <button 
            onClick={() => setUseTextInput(false)} 
            style={{...styles.modeButton, ...(!useTextInput ? styles.activeMode : {})}}
          >
            🎤 {t('consultation.voiceMode')}
          </button>
          <button 
            onClick={() => setUseTextInput(true)} 
            style={{...styles.modeButton, ...(useTextInput ? styles.activeMode : {})}}
          >
            ✏️ {t('consultation.textMode')}
          </button>
        </div>
        
        {!useTextInput ? (
          <div style={styles.voiceSection}>
            <div style={styles.voiceInstructions}>
              <p>🎤 {t('symptoms.speak')}</p>
              <p style={styles.tip}>💡 {t('symptoms.voiceTip')}</p>
              {voiceSettings.enabled && (
                <p style={styles.voiceTip}>🔊 {t('consultation.voiceOn')}</p>
              )}
              {contextPrompt && (
                <p style={styles.contextTip}>📚 {t('symptoms.contextTip')}</p>
              )}
            </div>
            
            {!isRecording ? (
              <button onClick={startVoiceRecording} style={styles.recordButton}>
                🎤 {t('symptoms.speak')}
              </button>
            ) : (
              <button onClick={stopVoiceRecording} style={styles.stopButton}>
                ⏹️ {t('symptoms.stop')}
              </button>
            )}
            
            {isRecording && (
              <div style={styles.recordingIndicator}>
                <span style={styles.redDot}></span>
                {t('consultation.recording')}
              </div>
            )}
            
            {transcript && !isRecording && (
              <div style={styles.transcriptPreview}>
                <strong>{t('chat.you')} {t('common.said')}:</strong>
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
                    <span>{t('ai.responding')}</span>
                  </div>
                ) : isAnalyzing ? (
                  t('symptoms.analyzing')
                ) : (
                  t('ai.analyzing')
                )}
              </div>
            )}
            
            {isStreaming && streamingText && (
              <div style={styles.streamingPreview}>
                <strong>{t('ai.typing')}:</strong>
                <p>{streamingText}<span className="cursor-blink">|</span></p>
              </div>
            )}
          </div>
        ) : (
          <div style={styles.textInputSection}>
            <h4>{t('consultation.describeSymptoms')}</h4>
            <textarea
              style={styles.textArea}
              placeholder={t('symptoms.placeholder')}
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
                📋 {t('consultation.exampleSymptom')}
              </button>
              <button 
                onClick={sendTextMessage}
                style={styles.sendButton}
                disabled={!manualText.trim() || isProcessing || isAnalyzing || isRecording}
              >
                {isProcessing ? t('ai.thinking') : t('consultation.sendToAI')}
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
  statusAuthFailed: {
    color: '#f59e0b', // Amber/orange for auth failure warning
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