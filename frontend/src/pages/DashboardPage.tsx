import { lazy, Suspense } from 'react';
import { TrendingUp, Building2 } from 'lucide-react';
import { useConsultation } from '../context/ConsultationContext';
import SkeletonLoader from '../components/shared/SkeletonLoader';

const EnhancedDashboard = lazy(() => import('../components/dashboard/EnhancedDashboard'));

export default function DashboardPage() {
  const {
    consultations, stats,
    showAnalytics, setShowAnalytics,
    handleOpenClinicDashboard, isCreatingClinic,
  } = useConsultation();

  return (
    <div style={styles.pageContainer}>
      <Suspense fallback={<SkeletonLoader />}>
        <EnhancedDashboard consultations={consultations} stats={stats} />
      </Suspense>
      <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setShowAnalytics(true)}
          style={styles.analyticsButton}
        >
          <TrendingUp size={16} /> View Analytics Dashboard
        </button>
        <button
          onClick={handleOpenClinicDashboard}
          style={styles.clinicButton}
          disabled={isCreatingClinic}
        >
          <Building2 size={18} /> {isCreatingClinic ? 'Loading Clinic...' : '🏥 Clinic Dashboard'}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    maxWidth: '1280px',
    margin: '40px auto',
    padding: '0 24px',
  },
  analyticsButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
  },
  clinicButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
};
