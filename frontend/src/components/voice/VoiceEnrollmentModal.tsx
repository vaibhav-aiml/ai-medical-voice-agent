import { useState, useRef } from 'react';
import { X, Mic, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { API_URL } from '../../config/api';

interface Props {
  onClose: () => void;
  userId: string;
}

export default function VoiceEnrollmentModal({ onClose, userId }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSuccess, setRecordingSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const countdownIntervalRef = useRef<any>(null);

  const getCleanAudioStream = (rawStream: MediaStream): MediaStream => {
    const isNCEnabled = localStorage.getItem('noiseCancellationEnabled') !== 'false';
    if (!isNCEnabled) return rawStream;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return rawStream;

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

      return destination.stream;
    } catch (err) {
      return rawStream;
    }
  };

  const startRecording = async () => {
    chunksRef.current = [];
    setErrorMsg('');
    setRecordingSuccess(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const cleanStream = getCleanAudioStream(stream);
      const mediaRecorder = new MediaRecorder(cleanStream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        await handleUpload(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Automatic recording cut-off after 4 seconds
      setCountdown(4);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err: any) {
      setErrorMsg('Could not access microphone. Please grant browser permissions.');
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(countdownIntervalRef.current);
    }
  };

  const handleUpload = async (audioBlob: Blob) => {
    setLoading(true);
    setErrorMsg('');

    try {
      // Convert audio blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const response = await fetch(`${API_URL}/voice/biometrics/enroll`, {
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
        setLoading(false);

        if (response.ok && data.success) {
          setRecordingSuccess(true);
        } else {
          setErrorMsg(data.message || 'Failed to register voice print.');
        }
      };
    } catch (err: any) {
      setLoading(false);
      setErrorMsg('Failed uploading voice print.');
      console.error(err);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mic size={22} color="#3b82f6" />
            <h3 style={styles.title}>Voice Biometrics Enrollment</h3>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.body}>
          <p style={styles.description}>
            Register your unique vocal print to secure your medical consults and verify your identity in future visits.
          </p>

          {!recordingSuccess ? (
            <div style={styles.recordContainer}>
              <div style={styles.passphraseBox}>
                <span style={styles.passphraseLabel}>Please read this sentence aloud clearly:</span>
                <p style={styles.passphraseText}>
                  "My voice is my secure medical identity signature."
                </p>
              </div>

              {errorMsg && (
                <div style={styles.errorBox}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div style={styles.actions}>
                {isRecording ? (
                  <button onClick={stopRecording} style={styles.stopButton}>
                    <div style={styles.recordingPulse} />
                    Stop ({countdown}s)
                  </button>
                ) : (
                  <button onClick={startRecording} disabled={loading} style={styles.recordButton}>
                    {loading ? (
                      <>
                        <RefreshCw size={16} className="spin" style={{ marginRight: '6px' }} />
                        Enrolling Voice print...
                      </>
                    ) : (
                      <>
                        <Mic size={18} style={{ marginRight: '6px' }} />
                        Start Voice Enrollment
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={styles.successContainer}>
              <CheckCircle size={56} color="#10b981" />
              <h4 style={styles.successTitle}>Enrollment Complete!</h4>
              <p style={styles.successDesc}>
                Your voice profile has been securely analyzed and saved as a 128-dimensional biometric template. Duplicate enrollments are now prevented.
              </p>
              <button onClick={onClose} style={styles.doneButton}>
                Close settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1100,
  },
  modal: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
    width: '100%',
    maxWidth: '480px',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
    color: 'var(--text-primary)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '16px',
    marginBottom: '20px',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
  },
  body: {
    fontSize: '14px',
  },
  description: {
    margin: '0 0 20px 0',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
  },
  recordContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  passphraseBox: {
    background: 'var(--bg-secondary)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px dashed #3b82f6',
    textAlign: 'center' as const,
  },
  passphraseLabel: {
    fontSize: '12px',
    color: '#3b82f6',
    fontWeight: 600,
  },
  passphraseText: {
    margin: '8px 0 0 0',
    fontSize: '16px',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#fee2e2',
    color: '#991b1b',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
  },
  recordButton: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
  },
  stopButton: {
    background: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  recordingPulse: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'white',
    animation: 'pulse 1s infinite',
  },
  successContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    padding: '10px 0',
  },
  successTitle: {
    margin: '16px 0 8px 0',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#10b981',
  },
  successDesc: {
    margin: '0 0 24px 0',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
  },
  doneButton: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 500,
  },
};
