import { lazy, Suspense } from 'react';
import { X, Activity, Brain, Heart, Bone, Baby, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../context/LanguageContext';
import { useConsultation } from '../context/ConsultationContext';
import { useBreakpoint } from '../hooks/useBreakpoint';
import SkeletonLoader from '../components/shared/SkeletonLoader';

const SpecialistSelector = lazy(() => import('../components/consultation/SpecialistSelector'));
const VoiceRecorder = lazy(() => import('../components/voice/VoiceRecorder'));
const ChatMessages = lazy(() => import('../components/consultation/ChatMessages'));

export default function ConsultationPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isMobile } = useBreakpoint();
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
    <div className="page-shell">
    <div className="page-card" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        ...styles.consultationHeader,
        ...(isMobile ? {
          display: 'flex',
          flexDirection: 'row' as const,
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '16px',
          paddingBottom: '16px',
        } : {})
      }}>
        <div style={{ flex: 1 }}>
          <h2 style={{...styles.consultationTitle, ...(isMobile ? { fontSize: '18px' } : {})}}>{t('consultation.title')}</h2>
          <p style={{...styles.consultationSubtitle, ...(isMobile ? { fontSize: '13px' } : {})}}>{t('consultation.subtitle')}</p>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            ...styles.closeButton,
            ...(isMobile ? {
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
            } : {})
          }}
          aria-label="Close consultation"
        >
          <X size={20} />
        </button>
      </div>
      {!consultationStarted ? (
        <div style={{...styles.setupSection, ...(isMobile ? { padding: '16px' } : {})}}>
          <Suspense fallback={<SkeletonLoader />}>
            <SpecialistSelector selectedSpecialist={selectedSpecialist} onSelect={setSelectedSpecialist} />
          </Suspense>
          <button
            onClick={startConsultation}
            disabled={!selectedSpecialist}
            style={{
              ...styles.startConsultButton,
              ...(isMobile ? {
                minHeight: '48px',
                fontSize: '16px',
                padding: '14px 20px',
                marginTop: '20px',
              } : {})
            }}
          >
            {t('consultation.startWith')} {selectedSpecialist || t('consultation.selectedSpecialist')}
          </button>
        </div>
      ) : (
        <div style={{...styles.activeConsultation, ...(isMobile ? { padding: '12px' } : {})}}>
          <div style={{
            ...styles.specialistInfo,
            ...(isMobile ? {
              flexDirection: 'column' as const,
              alignItems: 'stretch' as const,
              gap: '12px',
              marginBottom: '16px',
              padding: '12px 14px',
            } : {})
          }}>
            <div style={{
              ...styles.specialistBadge,
              ...(isMobile ? { minHeight: '44px', justifyContent: 'flex-start' } : {})
            }}>
              {getSpecialistIcon(selectedSpecialist)}
              <span>{selectedSpecialist} {t('consultation.specialist') || 'Specialist'}</span>
            </div>
            <button
              onClick={endConsultation}
              style={{
                ...styles.endButton,
                ...(isMobile ? {
                  minHeight: '44px',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                } : {})
              }}
            >
              {t('consultation.endConsultation')}
            </button>
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
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  consultationContainer: {
    maxWidth: '1200px',
    margin: '40px auto',
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
