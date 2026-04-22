import { useState, useEffect } from 'react';
import { X, Mic, Volume2, Play, Square, Check, ChevronRight, User, Bot, Radio, Settings, Volume1, VolumeX } from 'lucide-react';

interface VoiceSettings {
  enabled: boolean;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  autoSpeak: boolean;
}

const availableVoices = [
  { id: 'default', name: 'Default Voice', gender: 'neutral', accent: 'Standard', provider: 'System' },
  { id: 'google-us-female', name: 'Sarah - US English', gender: 'female', accent: 'American', provider: 'Google' },
  { id: 'google-us-male', name: 'Michael - US English', gender: 'male', accent: 'American', provider: 'Google' },
  { id: 'google-uk-female', name: 'Emma - UK English', gender: 'female', accent: 'British', provider: 'Google' },
  { id: 'google-uk-male', name: 'James - UK English', gender: 'male', accent: 'British', provider: 'Google' },
  { id: 'google-au-female', name: 'Olivia - Australian', gender: 'female', accent: 'Australian', provider: 'Google' },
  { id: 'amazon-joanna', name: 'Joanna - US English', gender: 'female', accent: 'American', provider: 'Amazon' },
  { id: 'amazon-matthew', name: 'Matthew - US English', gender: 'male', accent: 'American', provider: 'Amazon' },
  { id: 'amazon-amy', name: 'Amy - UK English', gender: 'female', accent: 'British', provider: 'Amazon' },
  { id: 'microsoft-jenny', name: 'Jenny - US English', gender: 'female', accent: 'American', provider: 'Microsoft' },
  { id: 'microsoft-guy', name: 'Guy - UK English', gender: 'male', accent: 'British', provider: 'Microsoft' },
];

interface Props {
  onClose: () => void;
  onSettingsChange?: (settings: VoiceSettings) => void;
}

export default function VoiceCustomization({ onClose, onSettingsChange }: Props) {
  const [settings, setSettings] = useState<VoiceSettings>({
    enabled: true,
    voice: 'default',
    rate: 1,
    pitch: 1,
    volume: 1,
    autoSpeak: true,
  });
  const [testMessage, setTestMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(availableVoices[0]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const saved = localStorage.getItem('voiceSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
      const voice = availableVoices.find(v => v.id === parsed.voice) || availableVoices[0];
      setSelectedVoice(voice);
    }
  };

  const saveSettings = (newSettings: VoiceSettings) => {
    localStorage.setItem('voiceSettings', JSON.stringify(newSettings));
    setSettings(newSettings);
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  const updateSetting = <K extends keyof VoiceSettings>(key: K, value: VoiceSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const speak = (text: string) => {
    if (!settings.enabled || !window.speechSynthesis) {
      alert('Speech synthesis is not supported or disabled');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    
    // Try to set voice
    if (settings.voice !== 'default') {
      const voices = window.speechSynthesis.getVoices();
      const selectedVoiceObj = voices.find(v => v.name.toLowerCase().includes(settings.voice.split('-')[1] || ''));
      if (selectedVoiceObj) {
        utterance.voice = selectedVoiceObj;
      }
    }
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const testVoices = [
    "Hello! I'm your AI medical assistant. How can I help you today?",
    "Based on your symptoms, I recommend getting plenty of rest and staying hydrated.",
    "Your consultation has been completed. You can download your report now.",
  ];

  const getGenderIcon = (gender: string) => {
    return gender === 'female' ? <User size={14} /> : <Bot size={14} />;
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <Mic size={24} />
          </div>
          <h2 style={styles.title}>Voice Customization</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.content}>
          {/* Enable Voice */}
          <div style={styles.settingCard}>
            <div style={styles.settingHeader}>
              <div style={styles.settingIcon}>
                <Volume2 size={20} />
              </div>
              <div>
                <h4>Enable Voice Responses</h4>
                <p>AI will speak its responses aloud</p>
              </div>
              <label style={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => updateSetting('enabled', e.target.checked)}
                />
                <span style={styles.slider}></span>
              </label>
            </div>
          </div>

          {/* Auto Speak */}
          <div style={styles.settingCard}>
            <div style={styles.settingHeader}>
              <div style={styles.settingIcon}>
                <Radio size={20} />
              </div>
              <div>
                <h4>Auto-Speak Responses</h4>
                <p>Automatically speak AI responses when received</p>
              </div>
              <label style={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.autoSpeak}
                  onChange={(e) => updateSetting('autoSpeak', e.target.checked)}
                />
                <span style={styles.slider}></span>
              </label>
            </div>
          </div>

          {/* Voice Selection */}
          <div style={styles.section}>
            <h3>Voice Selection</h3>
            <div style={styles.voiceGrid}>
              {availableVoices.map((voice) => (
                <div
                  key={voice.id}
                  onClick={() => {
                    setSelectedVoice(voice);
                    updateSetting('voice', voice.id);
                  }}
                  style={{
                    ...styles.voiceCard,
                    ...(selectedVoice.id === voice.id ? styles.voiceCardSelected : {}),
                  }}
                >
                  <div style={styles.voiceIcon}>
                    {getGenderIcon(voice.gender)}
                  </div>
                  <div style={styles.voiceInfo}>
                    <strong>{voice.name}</strong>
                    <span>{voice.accent} • {voice.provider}</span>
                  </div>
                  {selectedVoice.id === voice.id && (
                    <Check size={16} color="#10b981" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Speed Control */}
          <div style={styles.section}>
            <h3>Speech Rate</h3>
            <div style={styles.sliderContainer}>
              <span>Slow</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.rate}
                onChange={(e) => updateSetting('rate', parseFloat(e.target.value))}
                style={styles.rangeSlider}
              />
              <span>Fast</span>
            </div>
            <div style={styles.valueDisplay}>{settings.rate}x</div>
          </div>

          {/* Pitch Control */}
          <div style={styles.section}>
            <h3>Pitch</h3>
            <div style={styles.sliderContainer}>
              <span>Low</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.pitch}
                onChange={(e) => updateSetting('pitch', parseFloat(e.target.value))}
                style={styles.rangeSlider}
              />
              <span>High</span>
            </div>
            <div style={styles.valueDisplay}>{settings.pitch}x</div>
          </div>

          {/* Volume Control */}
          <div style={styles.section}>
            <h3>Volume</h3>
            <div style={styles.sliderContainer}>
              <VolumeX size={16} />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={(e) => updateSetting('volume', parseFloat(e.target.value))}
                style={styles.rangeSlider}
              />
              <Volume1 size={16} />
            </div>
            <div style={styles.valueDisplay}>{Math.round(settings.volume * 100)}%</div>
          </div>

          {/* Test Section */}
          <div style={styles.section}>
            <h3>Test Voice</h3>
            <div style={styles.testSection}>
              <select
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                style={styles.testSelect}
              >
                <option value="">Select a test message...</option>
                {testVoices.map((msg, i) => (
                  <option key={i} value={msg}>{msg.substring(0, 50)}...</option>
                ))}
              </select>
              <button
                onClick={() => testMessage && speak(testMessage)}
                disabled={!settings.enabled || !testMessage}
                style={styles.testButton}
              >
                {isSpeaking ? <Square size={16} /> : <Play size={16} />}
                {isSpeaking ? 'Stop' : 'Test Voice'}
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div style={styles.infoBox}>
            <p>💡 <strong>Tip:</strong> Voice features work best in Chrome, Edge, or Safari. Make sure your device volume is turned up!</p>
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
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'var(--bg-card)',
    borderRadius: '24px',
    maxWidth: '550px',
    width: '90%',
    maxHeight: '85vh',
    overflow: 'auto' as const,
    boxShadow: '0 20px 35px -10px rgba(0,0,0,0.2)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 24px',
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    color: 'white',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },
  headerIcon: {
    width: '36px',
    height: '36px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '20px',
    fontWeight: 600,
    margin: 0,
    flex: 1,
  },
  closeButton: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: 'white',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: '24px',
  },
  settingCard: {
    padding: '16px',
    background: 'var(--badge-bg)',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '1px solid var(--border-color)',
  },
  settingHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  settingIcon: {
    width: '40px',
    height: '40px',
    background: 'rgba(139, 92, 246, 0.1)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#8b5cf6',
  },
  switch: {
    position: 'relative' as const,
    display: 'inline-block',
    width: '50px',
    height: '24px',
    marginLeft: 'auto',
  },
  slider: {
    position: 'absolute' as const,
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#cbd5e1',
    transition: '.3s',
    borderRadius: '24px',
    '&:before': {
      position: 'absolute',
      content: '""',
      height: '18px',
      width: '18px',
      left: '3px',
      bottom: '3px',
      backgroundColor: 'white',
      transition: '.3s',
      borderRadius: '50%',
    }
  },
  section: {
    marginBottom: '24px',
  },
  voiceGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    maxHeight: '200px',
    overflow: 'auto',
    marginTop: '12px',
  },
  voiceCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px',
    background: 'var(--badge-bg)',
    borderRadius: '10px',
    cursor: 'pointer',
    border: '1px solid var(--border-color)',
    transition: 'all 0.2s ease',
  },
  voiceCardSelected: {
    borderColor: '#8b5cf6',
    background: 'rgba(139, 92, 246, 0.1)',
  },
  voiceIcon: {
    width: '32px',
    height: '32px',
    background: 'rgba(139, 92, 246, 0.1)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  sliderContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '8px',
  },
  rangeSlider: {
    flex: 1,
    height: '4px',
    WebkitAppearance: 'none',
    background: '#e2e8f0',
    borderRadius: '2px',
    outline: 'none',
  },
  valueDisplay: {
    textAlign: 'center' as const,
    marginTop: '8px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  testSection: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
  },
  testSelect: {
    flex: 1,
    padding: '10px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
  },
  testButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    background: '#8b5cf6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  infoBox: {
    padding: '12px',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '10px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
};

// Add slider styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  input[type="range"] {
    -webkit-appearance: none;
    background: #e2e8f0;
    border-radius: 2px;
    height: 4px;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #8b5cf6;
    cursor: pointer;
  }
  .switch input:checked + .slider {
    background-color: #8b5cf6;
  }
  .switch input:checked + .slider:before {
    transform: translateX(26px);
  }
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
`;
document.head.appendChild(styleSheet);