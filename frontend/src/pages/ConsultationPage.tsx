import { lazy, Suspense } from 'react';
import { X, Activity, Brain, Heart, Bone, Baby, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../context/LanguageContext';
import { useConsultation } from '../context/ConsultationContext';
import SkeletonLoader from '../components/shared/SkeletonLoader';

const SpecialistSelector = lazy(() => import('../components/consultation/SpecialistSelector'));
const VoiceRecorder = lazy(() => import('../components/voice/VoiceRecorder'));
const ChatMessages = lazy(() => import('../components/consultation/ChatMessages'));

export default function ConsultationPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const {
    consultationId, selectedSpecialist, setSelectedSpecialist,
    consultationStarted, messages, manualSymptoms,
    triageResult, setTriageResult, streamingMessage, isStreaming,
    startConsultation, endConsultation,
    handleTranscriptUpdate, handleAIResponse, addMessage,
    getCurrentUserId, getCurrentSessionId,
  } = useConsultation();

  const getSpecialistIcon = (type: string) => {
    switch(type) {
      case 'general': return <Stethoscope size={18} />;
      case 'orthopedic': return <Bone size={18} />;
      case 'cardiologist': return <Heart size={18} />;
      case 'neurologist': return <Brain size={18} />;
      case 'pediatrician': return <Baby size={18} />;
      default: return <Activity size={18} />;
    }
  };

  return (
    <div style={styles.consultationContainer}>
      <div style={styles.consultationHeader}>
        <div><h2 style={styles.consultationTitle}>{t('consultation.title')}</h2><p style={styles.consultationSubtitle}>{t('consultation.subtitle')}</p></div>
        <button onClick={() => navigate('/')} style={styles.closeButton}><X size={20} /></button>
      </div>
      {!consultationStarted ? (
        <div style={styles.setupSection}>
          <Suspense fallback={<SkeletonLoader />}>
            <SpecialistSelector selectedSpecialist={selectedSpecialist} onSelect={setSelectedSpecialist} />
          </Suspense>
          <button onClick={startConsultation} disabled={!selectedSpecialist} style={styles.startConsultButton}>{t('consultation.startWith')} {selectedSpecialist || t('consultation.selectedSpecialist')}</button>
        </div>
      ) : (
        <div style={styles.activeConsultation}>
          <div style={styles.specialistInfo}>
            <div style={styles.specialistBadge}>{getSpecialistIcon(selectedSpecialist)}<span>{selectedSpecialist} {t('consultation.specialist') || 'Specialist'}</span></div>
            <button onClick={endConsultation} style={styles.endButton}>{t('consultation.endConsultation')}</button>
          </div>
          <Suspense fallback={<SkeletonLoader />}>
            <VoiceRecorder
              consultationId={consultationId}
              specialistType={selectedSpecialist}
              onTranscriptUpdate={handleTranscriptUpdate}
              onAIResponse={handleAIResponse}
              onTriageResult={setTriageResult}
              userId={getCurrentUserId()}
              initialHistory={messages.map(m => ({
                role: m.type === 'user' ? 'user' : 'assistant',
                content: m.content
              }))}
            />
          </Suspense>

          <Suspense fallback={<div>Loading Chat...</div>}>
            <ChatMessages
              messages={messages}
              onAddMessage={addMessage}
              sessionId={getCurrentSessionId()}
              userId={getCurrentUserId()}
              triageResult={triageResult}
              streamingMessage={streamingMessage}
              isStreaming={isStreaming}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  consultationContainer: {
    maxWidth: '1200px',
    margin: '40px auto',
    padding: '32px',
    background: 'var(--bg-card)',
    borderRadius: '24px',
    border: '1px solid var(--border-color)',
  },
  consultationTitle: {
    fontSize: '22px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  consultationSubtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  consultationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '1px solid var(--border-color)',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    padding: '8px',
    borderRadius: '8px',
  },
  setupSection: {
    padding: '20px',
  },
  startConsultButton: {
    marginTop: '30px',
    padding: '14px 28px',
    fontSize: '16px',
    background: 'var(--button-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 500,
    width: '100%',
  },
  activeConsultation: {
    padding: '20px',
  },
  specialistInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    padding: '14px 20px',
    background: 'var(--badge-bg)',
    borderRadius: '12px',
  },
  specialistBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--button-primary)',
  },
  endButton: {
    padding: '8px 20px',
    background: 'var(--button-danger)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '13px',
  },
};
