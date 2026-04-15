import { DashboardStats } from '../types/consultation.types';

interface Props {
  stats: DashboardStats;
}

export default function DashboardStatsComponent({ stats }: Props) {
  return (
    <div style={styles.container}>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📋</div>
          <div style={styles.statValue}>{stats.totalConsultations}</div>
          <div style={styles.statLabel}>Total Consultations</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statValue}>{stats.completedConsultations}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⏱️</div>
          <div style={styles.statValue}>{stats.averageDuration}</div>
          <div style={styles.statLabel}>Avg Duration (min)</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📅</div>
          <div style={styles.statValue}>{stats.pendingFollowUps}</div>
          <div style={styles.statLabel}>Pending Follow-ups</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    marginBottom: '30px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  statCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center' as const,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  statIcon: {
    fontSize: '32px',
    marginBottom: '10px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: '5px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
  },
};