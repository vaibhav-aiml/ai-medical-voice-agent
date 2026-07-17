import {
  Download, Calendar, Star, FileText, CheckCircle,
  Activity, Brain, Heart, Bone, Baby, Stethoscope
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useConsultation } from '../context/ConsultationContext';
import { ConsultationSession } from '../types/consultation.types';

export default function ReportsPage() {
  const { t } = useLanguage();
  const {
    consultations,
    handleViewReport, handleBookAppointment,
    handleRateConsultation, handleViewEnhancedReport,
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
    <div style={styles.pageContainer}>
      <div style={styles.pageHeader}><h2 style={styles.pageTitle}>{t('reports.title')}</h2><p style={styles.pageSubtitle}>{t('reports.subtitle')}</p></div>
      <div style={styles.reportsList}>
        {consultations.filter(c => c.status === 'completed').map((consultation: ConsultationSession) => (
          <div key={consultation.id} style={styles.reportCard}>
            <div style={styles.reportHeader}>
              <div style={styles.reportIconArea}>{getSpecialistIcon(consultation.specialistType)}</div>
              <div style={styles.reportInfo}>
                <h3 style={styles.reportTitle}>{t('reports.consultationWith')} {consultation.specialistName}</h3>
                <p style={styles.reportDate}>{new Date(consultation.startedAt).toLocaleDateString()}</p>
              </div>
              <div style={styles.reportStatus}>
                <CheckCircle size={14} color="#10b981" />
                <span>{t('reports.completed')}</span>
              </div>
            </div>
            <div style={styles.reportContent}>
              <p><strong>{t('reports.symptoms')}:</strong> {consultation.symptoms?.substring(0, 100)}...</p>
              <p><strong>{t('reports.duration')}:</strong> {consultation.duration} {t('reports.minutes')}</p>
            </div>
            <div style={styles.reportActions}>
              <button onClick={() => handleViewReport(consultation.id)} style={styles.downloadButton}>
                <Download size={16} />
                <span>{t('reports.viewReport')}</span>
              </button>
              <button onClick={() => handleBookAppointment(consultation)} style={styles.bookButton}>
                <Calendar size={16} />
                <span>{t('reports.bookFollowup')}</span>
              </button>
              <button onClick={() => handleRateConsultation(consultation)} style={styles.ratingButton}>
                <Star size={16} />
                <span>{t('reports.rateConsultation')}</span>
              </button>
              <button onClick={() => handleViewEnhancedReport(consultation)} style={styles.enhancedReportButton}>
                <FileText size={16} />
                <span>View SOAP Report</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pageContainer: { maxWidth: '1280px', margin: '40px auto', padding: '0 24px' },
  pageHeader: { marginBottom: '32px' },
  pageTitle: { fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' },
  pageSubtitle: { fontSize: '14px', color: 'var(--text-secondary)' },
  reportsList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' },
  reportCard: { background: 'var(--bg-card)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-color)' },
  reportHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' },
  reportIconArea: { width: '40px', height: '40px', background: 'var(--badge-bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--button-primary)' },
  reportInfo: { flex: 1 },
  reportTitle: { fontSize: '15px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' },
  reportDate: { fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0' },
  reportStatus: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--status-completed-text)', background: 'var(--status-completed-bg)', padding: '4px 10px', borderRadius: '20px' },
  reportContent: { marginBottom: '16px', color: 'var(--text-secondary)' },
  reportActions: { display: 'flex', flexDirection: 'column' as const, gap: '8px' },
  downloadButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '10px', background: 'var(--badge-bg)', color: 'var(--text-secondary)', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' },
  bookButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '10px', background: 'var(--badge-bg)', color: 'var(--button-primary)', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' },
  ratingButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '10px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' },
  enhancedReportButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '10px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' },
};
