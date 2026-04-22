import { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff, Camera, MessageSquare } from 'lucide-react';

interface Props {
  consultationId: string;
  specialistName: string;
  specialistType: string;
  onClose: () => void;
  onEndCall: () => void;
}

export default function VideoConsultation({ consultationId, specialistName, specialistType, onClose, onEndCall }: Props) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: Date }>>([]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startVideoCall();
    
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    
    return () => {
      clearInterval(interval);
      endCall();
    };
  }, []);

  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setTimeout(() => {
        setIsConnecting(false);
        addSystemMessage('Video call connected');
        addSystemMessage(`You are now connected with ${specialistName} (${specialistType})`);
      }, 2000);
      
    } catch (error) {
      console.error('Error accessing camera/microphone:', error);
      alert('Please allow camera and microphone access to start video consultation');
      onClose();
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
      addSystemMessage(isMuted ? 'Microphone unmuted' : 'Microphone muted');
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
      addSystemMessage(isVideoOff ? 'Camera turned on' : 'Camera turned off');
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    onEndCall();
    onClose();
  };

  const addSystemMessage = (text: string) => {
    setMessages(prev => [...prev, { sender: 'System', text, time: new Date() }]);
  };

  const sendMessage = () => {
    if (chatMessage.trim()) {
      setMessages(prev => [...prev, { sender: 'You', text: chatMessage, time: new Date() }]);
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          sender: specialistName, 
          text: `Thank you for sharing. I understand your concern.`, 
          time: new Date() 
        }]);
      }, 1000);
      setChatMessage('');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Video Consultation</h2>
            <p style={styles.subtitle}>
              {specialistName} • {specialistType} • {formatDuration(duration)}
            </p>
          </div>
          <button onClick={endCall} style={styles.endCallButton}>
            <PhoneOff size={20} /> End Call
          </button>
        </div>

        <div style={styles.videoGrid}>
          <div style={styles.remoteVideoContainer}>
            {isConnecting ? (
              <div style={styles.connectingOverlay}>
                <div style={styles.spinner}></div>
                <p>Connecting to {specialistName}...</p>
              </div>
            ) : (
              <div style={styles.remoteVideo}>
                <div style={styles.placeholderVideo}>
                  <Camera size={48} />
                  <p>{specialistName}</p>
                  <p style={styles.placeholderText}>AI Doctor</p>
                </div>
              </div>
            )}
          </div>

          <div style={styles.localVideoContainer}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={styles.localVideo}
            />
            <div style={styles.controlsBar}>
              <button onClick={toggleMute} style={styles.controlButton}>
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button onClick={toggleVideo} style={styles.controlButton}>
                {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div style={styles.chatSection}>
          <div style={styles.chatHeader}>
            <MessageSquare size={16} />
            <span>Chat with {specialistName}</span>
          </div>
          <div style={styles.chatMessages}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.chatMessage,
                  ...(msg.sender === 'You' ? styles.chatMessageUser : styles.chatMessageDoctor),
                }}
              >
                <strong>{msg.sender}:</strong>
                <p>{msg.text}</p>
                <span style={styles.chatTime}>
                  {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
          <div style={styles.chatInputContainer}>
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              style={styles.chatInput}
            />
            <button onClick={sendMessage} style={styles.sendButton}>
              Send
            </button>
          </div>
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
    background: 'rgba(0,0,0,0.9)',
    zIndex: 2000,
  },
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    background: '#1a1a2e',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    background: 'linear-gradient(135deg, #16213e, #0f3460)',
    color: 'white',
  },
  title: {
    fontSize: '20px',
    fontWeight: 600,
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    opacity: 0.8,
    marginTop: '4px',
  },
  endCallButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  videoGrid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    padding: '20px',
  },
  remoteVideoContainer: {
    position: 'relative' as const,
    background: '#0f0f1a',
    borderRadius: '16px',
    overflow: 'hidden',
    minHeight: '400px',
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f0f1a',
  },
  placeholderVideo: {
    textAlign: 'center' as const,
    color: 'white',
  },
  placeholderText: {
    fontSize: '12px',
    opacity: 0.7,
  },
  localVideoContainer: {
    position: 'relative' as const,
    background: '#0f0f1a',
    borderRadius: '16px',
    overflow: 'hidden',
    minHeight: '400px',
  },
  localVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  connectingOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.8)',
    color: 'white',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  controlsBar: {
    position: 'absolute' as const,
    bottom: '16px',
    right: '16px',
    display: 'flex',
    gap: '8px',
  },
  controlButton: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.6)',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    color: 'white',
  },
  chatSection: {
    width: '320px',
    background: '#16213e',
    borderLeft: '1px solid #0f3460',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'absolute' as const,
    right: 0,
    top: 0,
    bottom: 0,
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px',
    borderBottom: '1px solid #0f3460',
    color: 'white',
    fontWeight: 500,
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  chatMessage: {
    padding: '10px',
    borderRadius: '10px',
    maxWidth: '80%',
  },
  chatMessageUser: {
    background: '#3b82f6',
    color: 'white',
    alignSelf: 'flex-end',
  },
  chatMessageDoctor: {
    background: '#1f2937',
    color: 'white',
    alignSelf: 'flex-start',
  },
  chatTime: {
    fontSize: '10px',
    opacity: 0.7,
    display: 'block',
    marginTop: '4px',
  },
  chatInputContainer: {
    display: 'flex',
    padding: '16px',
    borderTop: '1px solid #0f3460',
    gap: '8px',
  },
  chatInput: {
    flex: 1,
    padding: '10px',
    background: '#1f2937',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    outline: 'none',
  },
  sendButton: {
    padding: '10px 20px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

// Add animation CSS
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);