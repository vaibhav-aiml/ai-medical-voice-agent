import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import apiClient from '../../services/apiClient';
import { API_URL } from '../../config/api';
import { useVoiceSocket } from '../../hooks/useVoiceSocket';
import TriageDisplay from '../consultation/TriageDisplay';
import { useLanguage } from '../../context/LanguageContext';
import { cleanTextForSpeech, splitIntoSentences } from '../../utils/cleanTextForSpeech';
import { isMoreUrgent } from '../../utils/triageUtils';

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
    stress: '#f59e0b', 
    anxiety: '#8b5cf6', 
    happiness: '#10b981', 
    sadness: '#3b82f6', 
    anger: '#ef4444', 
    fear: '#ec4899', 
    neutral: '#6b7280', 
  };
  return colorMap[emotion] || '#6b7280';
};

export default function VoiceRecorder({ consultationId, specialistType, onTranscriptUpdate, onAIResponse, onTriageResult, userId, initialHistory }: Props) {
  const { language, t } = useLanguage();
  const { socket, socketRef, connectionStatus, sendMessage } = useVoiceSocket(consultationId);
  const onAIResponseRef = useRef(onAIResponse);
  const onTranscriptUpdateRef = useRef(onTranscriptUpdate);
  const tRef = useRef(t);
  useEffect(() => {
    onAIResponseRef.current = onAIResponse;
    onTranscriptUpdateRef.current = onTranscriptUpdate;
    tRef.current = t;
  }, [onAIResponse, onTranscriptUpdate, t]);
  const consultationIdRef = useRef(consultationId);
  const specialistTypeRef = useRef(specialistType);
  const userIdRef = useRef(userId);
  const contextPromptRef = useRef('');
  const conversationHistoryRef = useRef<{role: string, content: string}[]>(initialHistory || []);
  const languageRef = useRef(language);

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualText, setManualText] = useState('');
  const [inputMode, setInputMode] = useState<'voice' | 'text' | 'photo'>('voice');
  const useTextInput = inputMode === 'text';
  const setUseTextInput = (useText: boolean) => setInputMode(useText ? 'text' : 'voice');

  // Photo Mode state
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = useState<string>('');
  const [consentAcknowledged, setConsentAcknowledged] = useState<boolean>(false);
  const [isPhotoAnalyzing, setIsPhotoAnalyzing] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [showTriageAlert, setShowTriageAlert] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [contextPrompt, _setContextPrompt] = useState('');
  
  const setContextPrompt = useCallback((val: string) => {
    _setContextPrompt(val);
    contextPromptRef.current = val;
  }, []);
  const [conversationHistory, _setConversationHistory] = useState<{role: string, content: string}[]>(() => initialHistory || []);
  
  const setConversationHistory = useCallback((updater: React.SetStateAction<{role: string, content: string}[]>) => {
    _setConversationHistory(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      conversationHistoryRef.current = next;
      return next;
    });
  }, []);
  const finalTranscriptRef = useRef<string>('');
  const accumulatedResponseRef = useRef<string>('');
  const hasReceivedResponseRef = useRef<boolean>(false);
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);
  const [emotionConfidence, setEmotionConfidence] = useState<number | null>(null);
  const [biometricStatus, setBiometricStatus] = useState<string>(''); 
  useEffect(() => {
    if (initialHistory && initialHistory.length > 0) {
      setConversationHistory(initialHistory);
    }
  }, [initialHistory, setConversationHistory]);
  useEffect(() => { consultationIdRef.current = consultationId; }, [consultationId]);
  useEffect(() => { specialistTypeRef.current = specialistType; }, [specialistType]);
  useEffect(() => { userIdRef.current = userId; }, [userId]);
  useEffect(() => { languageRef.current = language; }, [language]);
  const isProcessingRef = useRef(isProcessing);
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);
  const [biometricConfidence, setBiometricConfidence] = useState<number>(0);
  const verifyRecorderRef = useRef<MediaRecorder | null>(null);
  const verifyChunksRef = useRef<Blob[]>([]);
  const [noiseCancellationEnabled, setNoiseCancellationEnabled] = useState(() => {
    const saved = localStorage.getItem('noiseCancellationEnabled');
    return saved !== 'false'; 
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
      const hpFilter = audioCtx.createBiquadFilter();
      hpFilter.type = 'highpass';
      hpFilter.frequency.value = 100;
      const lpFilter = audioCtx.createBiquadFilter();
      lpFilter.type = 'lowpass';
      lpFilter.frequency.value = 3000;
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
  const [voiceSettings, setVoiceSettings] = useState(() => {
    const saved = localStorage.getItem('voiceSettings');
    return saved ? JSON.parse(saved) : { enabled: true, voice: 'default', rate: 1, pitch: 1, volume: 1, autoSpeak: true };
  });
  useEffect(() => {
    const loadContext = async () => {
      if (!userId) return;
      
      try {
        const response = await apiClient.get(`/conversation/previous-symptoms/${userId}`);
        const data = response.data;
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
  useEffect(() => {
    if (consultationId) {
      setConversationHistory([]);
      accumulatedResponseRef.current = '';
    }
  }, [consultationId]);
  const speakResponse = useCallback((text: string) => {
    if (!voiceSettings.enabled || !window.speechSynthesis) return;

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return;

    window.speechSynthesis.cancel();

    const sentences = splitIntoSentences(cleaned);
    if (sentences.length === 0) return;

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
    const voiceName = voiceSettings.voice !== 'default' ? voiceMap[voiceSettings.voice] : undefined;
    const selectedVoice = voiceName ? voices.find(v => v.name.includes(voiceName)) : undefined;

    // Enqueue sentence chunks to prevent Chromium 15-second utterance truncation bug
    sentences.forEach((sentence) => {
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;
      if (selectedVoice) utterance.voice = selectedVoice;
      window.speechSynthesis.speak(utterance);
    });

    // Chromium keep-alive guard: periodically resume synthesis if stalled
    const keepAliveInterval = setInterval(() => {
      if (!window.speechSynthesis || !window.speechSynthesis.speaking) {
        clearInterval(keepAliveInterval);
      } else {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  }, [voiceSettings.enabled, voiceSettings.rate, voiceSettings.pitch, voiceSettings.volume, voiceSettings.voice]);
  const voiceSettingsRef = useRef(voiceSettings);
  const speakResponseRef = useRef(speakResponse);

  useEffect(() => {
    voiceSettingsRef.current = voiceSettings;
    speakResponseRef.current = speakResponse;
  }, [voiceSettings, speakResponse]);
  const getAIResponseStream = useCallback((symptoms: string, source: 'voice' | 'text' = 'voice'): boolean => {
    const currentSocket = socketRef.current;
    console.log(`📤 [${source}] Attempting to send streaming request. Socket:`, currentSocket?.id, 'Connected:', currentSocket?.connected);
    console.log('📚 Conversation history length:', conversationHistoryRef.current.length);

    const payload = {
      consultationId: consultationIdRef.current,
      transcript: symptoms,
      specialistType: specialistTypeRef.current,
      userId: userIdRef.current,
      contextPrompt: contextPromptRef.current || undefined,
      conversationHistory: conversationHistoryRef.current,
      language: languageRef.current,
      source, 
    };

    const sent = sendMessage('get-ai-response-stream', payload);
    if (sent) {
      console.log(`✅ [${source}] Streaming request sent successfully for consultation:`, consultationIdRef.current);
    } else {
      console.error(`❌ [${source}] Failed to send streaming request — socket not connected`);
    }
    return sent;
  }, [sendMessage]);
  const analyzeSymptomsForTriage = async (symptoms: string) => {
    setIsAnalyzing(true);
    try {
      const triageResponse = await apiClient.post('/triage/analyze', { symptoms });
      const triageData = triageResponse.data;
      
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
      const speechLang = getSpeechRecognitionCode(language);
      recognitionInstance.lang = speechLang;
      console.log(`🎤 [VoiceRecorder] Speech recognition language set to: ${speechLang} (${language})`);
      
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
          console.log('🎤 [VoiceRecorder] Final transcript captured:', finalTranscript);
        }
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('🎤 [VoiceRecorder] Recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert(tRef.current('errors.microphone'));
        }
      };
      recognitionInstance.onend = () => {
        console.log('🎤 [VoiceRecorder] Recognition ended. Transcript:', finalTranscriptRef.current);
        console.log('🔌 [VoiceRecorder] Socket state at onend — ref:', socketRef.current?.id, 'connected:', socketRef.current?.connected);
        setIsRecording(false);
        if (finalTranscriptRef.current && !isProcessingRef.current) {
          const spokenText = finalTranscriptRef.current;
          const userMessage = { role: 'user', content: spokenText };
          setConversationHistory(prev => [...prev, userMessage]);
          onTranscriptUpdateRef.current(spokenText);
          hasReceivedResponseRef.current = false;
          setIsProcessing(true);
          const sent = getAIResponseStream(spokenText, 'voice');
          if (!sent) {
            console.error('❌ [VoiceRecorder] Voice message failed — socket not connected. socketRef:', socketRef.current);
            setIsProcessing(false);
            onAIResponseRef.current(
              tRef.current('errors.server') || 'Connection lost. Please wait for reconnection or refresh the page.',
              true
            );
          }
          analyzeSymptomsForTriage(spokenText);
        }
      };
      
      setRecognition(recognitionInstance);
    } else {
      console.log('Web Speech API not supported');
      setUseTextInput(true);
    }
  }, [language, getAIResponseStream, setConversationHistory]);
  useEffect(() => {
    if (!socket) return;
    
    const handleChunk = (data: any) => {
      if (data.isComplete) {
        console.log('✅ Streaming complete');
        setIsStreaming(false);
        hasReceivedResponseRef.current = true;
        
        const finalResponse = (data.fullResponse || accumulatedResponseRef.current || data.chunk || '').trim();
        
        if (finalResponse) {
          const assistantMessage = { role: 'assistant', content: finalResponse };
          setConversationHistory(prev => [...prev, assistantMessage]);
          onAIResponseRef.current(finalResponse, true);
        }
        
        accumulatedResponseRef.current = '';
        setStreamingText('');
        if (voiceSettingsRef.current.autoSpeak && voiceSettingsRef.current.enabled && finalResponse) {
          try {
            speakResponseRef.current(finalResponse);
          } catch (speechErr) {
            console.error('Speech synthesis error:', speechErr);
          }
        }
        setIsProcessing(false);
      } else if (data.chunk) {
        if (!isStreaming) {
          setIsStreaming(true);
        }
        hasReceivedResponseRef.current = true;
        accumulatedResponseRef.current += data.chunk;
        setStreamingText(accumulatedResponseRef.current);
        onAIResponseRef.current(data.chunk, false);
      }
    };
    
    const handleResponse = (data: any) => {
      console.log('🤖 AI Response from Groq:', data);
      if (data.response && data.response.trim()) {
        hasReceivedResponseRef.current = true;
        const resp = data.response.trim();
        setConversationHistory(prev => [...prev, { role: 'assistant', content: resp }]);
        onAIResponseRef.current(resp, true);
        if (voiceSettingsRef.current.autoSpeak && voiceSettingsRef.current.enabled) {
          try {
            speakResponseRef.current(resp);
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
      if (!hasReceivedResponseRef.current && !accumulatedResponseRef.current) {
        onAIResponseRef.current(tRef.current('errors.server') || 'Server error. Please try again.', true);
      }
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
            try {
              const base64Audio = (reader.result as string)?.split(',')[1] || '';
              const response = await apiClient.post('/voice/biometrics/verify', {
                userId,
                audio: base64Audio,
              });
              const data = response.data;
              if (data.success) {
                setBiometricStatus(data.isMatch ? 'verified' : 'mismatch');
                setBiometricConfidence(data.confidence);
              }
            } catch (asyncErr: any) {
              if (axios.isAxiosError(asyncErr)) {
                const data = asyncErr.response?.data;
                if (asyncErr.response?.status === 400 && data?.message && data.message.includes('No enrolled voice signature')) {
                  setBiometricStatus('unregistered');
                  setBiometricConfidence(0);
                  return;
                }
              }
              console.error('Asynchronous biometrics verify failed:', asyncErr);
            }
          };
        } catch (verifErr) {
          console.error('Biometrics verify error:', verifErr);
        }
      };

      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      }, 3000);
    } catch (err) {
      console.warn('Failed to start biometric verification recording:', err);
    }
  };

  // Audio queue reset on component unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startVoiceRecording = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (recognition) {
      setTranscript('');
      finalTranscriptRef.current = '';
      accumulatedResponseRef.current = '';
      recognition.start();
      setIsRecording(true);
      console.log('🎤 Voice recording started');
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
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      console.log('📤 [VoiceRecorder] Sending text message:', manualText);
      
      const userMessage = { role: 'user', content: manualText };
      setConversationHistory(prev => [...prev, userMessage]);
      
      setTranscript(manualText);
      onTranscriptUpdate(manualText);
      accumulatedResponseRef.current = '';
      hasReceivedResponseRef.current = false;
      setIsProcessing(true);
      const sent = getAIResponseStream(manualText, 'text');
      if (!sent) {
        console.error('❌ [VoiceRecorder] Text message failed — socket not connected');
        setIsProcessing(false);
        onAIResponse(
          t('errors.server') || 'Connection lost. Please wait for reconnection or refresh the page.',
          true
        );
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

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setPhotoError('Image file is too large. Maximum size is 8MB.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setPhotoError('Unsupported image format. Please select a JPEG, PNG, or WebP image.');
      return;
    }

    setPhotoError(null);
    setSelectedPhotoFile(file);
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoPreviewUrl(URL.createObjectURL(file));
  };

  const handleClearPhoto = () => {
    setSelectedPhotoFile(null);
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoPreviewUrl(null);
    setPhotoError(null);
  };

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  const submitPhoto = async () => {
    if (!selectedPhotoFile || !consentAcknowledged) return;

    setIsPhotoAnalyzing(true);
    setPhotoError(null);

    // 1. Primary triage path: if patient provided caption, analyze raw text immediately
    const trimmedCaption = photoCaption.trim();
    if (trimmedCaption) {
      console.log('🩺 [Photo Mode] Triggering primary frontend triage with patient caption:', trimmedCaption);
      analyzeSymptomsForTriage(trimmedCaption);
    }

    // 2. Add user message to chat UI
    const displayMsg = trimmedCaption
      ? `📷 [Photo Uploaded] ${trimmedCaption}`
      : '📷 [Photo Uploaded for visual symptom analysis]';
    onTranscriptUpdate(displayMsg);
    setConversationHistory(prev => [...prev, { role: 'user', content: displayMsg }]);

    // 3. Prepare multipart payload
    const formData = new FormData();
    formData.append('photo', selectedPhotoFile);
    formData.append('consentAcknowledged', 'true');
    if (trimmedCaption) {
      formData.append('caption', trimmedCaption);
    }
    formData.append('specialistType', specialistTypeRef.current || 'general');
    formData.append('language', languageRef.current || 'en');

    try {
      const response = await apiClient.post(
        `/consultation/${consultationIdRef.current}/photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const data = response.data;
      if (data.success && data.analysis) {
        // Append AI response to chat
        onAIResponse(data.analysis, false);
        setConversationHistory(prev => [...prev, { role: 'assistant', content: data.analysis }]);

        // 4. Secondary triage backstop:
        // If secondary backend triage is strictly more urgent than our current triage result,
        // upgrade the triage state using the single-source-of-truth isMoreUrgent() comparison
        if (data.triageResult) {
          const backendUrgency = data.triageResult.urgencyLevel;
          const currentUrgency = triageResult?.urgencyLevel;

          if (!currentUrgency || isMoreUrgent(backendUrgency, currentUrgency)) {
            console.log('🚨 [Photo Mode] Secondary backend triage upgraded urgency level to:', backendUrgency);
            setTriageResult(data.triageResult);
            if (onTriageResult) {
              onTriageResult(data.triageResult);
            }
            if (backendUrgency === 'emergency_immediate') {
              setShowTriageAlert(true);
            }
          }
        }

        // Reset photo upload form on success
        setSelectedPhotoFile(null);
        if (photoPreviewUrl) {
          URL.revokeObjectURL(photoPreviewUrl);
        }
        setPhotoPreviewUrl(null);
        setPhotoCaption('');
        setConsentAcknowledged(false);
      } else {
        setPhotoError(data.error || 'Photo analysis did not produce a response. Please try again.');
      }
    } catch (err: any) {
      console.error('Photo analysis request error:', err);
      const serverError = err.response?.data?.error || err.message;
      setPhotoError(serverError || 'Failed to analyze photo. Please try again or switch to text/voice mode.');
    } finally {
      setIsPhotoAnalyzing(false);
    }
  };

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
            onClick={() => setInputMode('voice')} 
            style={{...styles.modeButton, ...(inputMode === 'voice' ? styles.activeMode : {})}}
          >
            🎤 {t('consultation.voiceMode')}
          </button>
          <button 
            onClick={() => setInputMode('text')} 
            style={{...styles.modeButton, ...(inputMode === 'text' ? styles.activeMode : {})}}
          >
            ✏️ {t('consultation.textMode')}
          </button>
          <button 
            onClick={() => setInputMode('photo')} 
            style={{...styles.modeButton, ...(inputMode === 'photo' ? styles.activeMode : {})}}
          >
            📷 {t('consultation.photoMode') || 'Photo Analysis'}
          </button>
        </div>
        
        {inputMode === 'voice' && (
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
        )}

        {inputMode === 'text' && (
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

        {inputMode === 'photo' && (
          <div style={styles.photoSection}>
            {/* Non-dismissable Medical Disclaimer */}
            <div style={styles.photoDisclaimer}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '18px' }}>⚠️</span>
                <strong style={{ color: '#b45309' }}>Photo Analysis Advisory</strong>
              </div>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: '#92400e' }}>
                Photo analysis describes visible features and possible related conditions — it is <strong>not a diagnosis</strong>. If you notice rapid changes, bleeding, severe pain, or other concerning signs, see a doctor in person immediately.
              </p>
            </div>

            {/* Photo Selection / Camera */}
            <div style={styles.photoInputContainer}>
              {!photoPreviewUrl ? (
                <label style={styles.uploadArea}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    style={{ display: 'none' }}
                    onChange={handlePhotoSelect}
                    disabled={isPhotoAnalyzing}
                  />
                  <span style={{ fontSize: '32px' }}>📷</span>
                  <span style={{ fontWeight: 'bold', color: '#4f46e5' }}>
                    Take a photo or choose from device
                  </span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    Supports JPEG, PNG, WebP (up to 8MB)
                  </span>
                </label>
              ) : (
                <div style={styles.previewContainer}>
                  <img
                    src={photoPreviewUrl}
                    alt="Symptom preview"
                    style={styles.previewImage}
                  />
                  <button
                    type="button"
                    onClick={handleClearPhoto}
                    style={styles.retakeButton}
                    disabled={isPhotoAnalyzing}
                  >
                    🔄 Retake / Choose Different Photo
                  </button>
                </div>
              )}
            </div>

            {/* Optional Caption Field */}
            <div style={{ marginTop: '10px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#374151' }}>
                Optional symptom notes (Duration, pain level, changes):
              </label>
              <textarea
                style={styles.captionArea}
                placeholder="Add any details — how long you've had this, pain level, anything else (optional)"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                rows={2}
                disabled={isPhotoAnalyzing}
              />
            </div>

            {/* Mandatory Consent Checkbox */}
            <div style={styles.consentRow}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
                <input
                  type="checkbox"
                  checked={consentAcknowledged}
                  onChange={(e) => setConsentAcknowledged(e.target.checked)}
                  disabled={isPhotoAnalyzing}
                  style={{ marginTop: '3px' }}
                />
                <span>
                  I understand this is <strong>not a diagnosis</strong> and consent to this photo being stored and analyzed as part of my medical record.
                </span>
              </label>
            </div>

            {/* Error banner if any */}
            {photoError && (
              <div style={styles.photoErrorBanner}>
                <span>⚠️ {photoError}</span>
              </div>
            )}

            {/* Loading or Submit Action */}
            {isPhotoAnalyzing ? (
              <div style={styles.photoAnalyzingIndicator}>
                <div className="typing-dots">
                  <span></span><span></span><span></span>
                </div>
                <span>📸 Analyzing your photo… This may take a moment.</span>
              </div>
            ) : (
              <div style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={submitPhoto}
                  disabled={!selectedPhotoFile || !consentAcknowledged || isPhotoAnalyzing}
                  style={{
                    ...styles.photoSubmitButton,
                    ...((!selectedPhotoFile || !consentAcknowledged || isPhotoAnalyzing) ? styles.disabledButton : {})
                  }}
                >
                  Analyze Photo
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {}
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
    color: '#f59e0b', 
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
  photoSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    textAlign: 'center' as const,
  },
  photoDisclaimer: {
    padding: '12px 16px',
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '10px',
    textAlign: 'left' as const,
  },
  photoInputContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadArea: {
    width: '100%',
    padding: '30px 20px',
    border: '2px dashed #6366f1',
    borderRadius: '12px',
    background: '#f5f3ff',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
    boxSizing: 'border-box' as const,
  },
  previewContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '12px',
    width: '100%',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '260px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    objectFit: 'contain' as const,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  retakeButton: {
    padding: '8px 16px',
    fontSize: '13px',
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#374151',
    fontWeight: '500',
  },
  captionArea: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
  },
  consentRow: {
    padding: '12px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    textAlign: 'left' as const,
  },
  photoErrorBanner: {
    padding: '10px 14px',
    background: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: '8px',
    color: '#b91c1c',
    fontSize: '13px',
    textAlign: 'left' as const,
  },
  photoAnalyzingIndicator: {
    padding: '16px',
    background: '#e0e7ff',
    borderRadius: '10px',
    color: '#4338ca',
    fontWeight: 'bold',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },
  photoSubmitButton: {
    padding: '14px 28px',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    maxWidth: '320px',
    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
  },
  disabledButton: {
    background: '#9ca3af',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
};
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