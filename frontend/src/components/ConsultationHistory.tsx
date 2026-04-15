import { ConsultationSession } from '../types/consultation.types';

interface Props {
  consultations: ConsultationSession[];
  onViewReport: (consultationId: string) => void;
  onNewConsultation: () => void;
}

export default function ConsultationHistory({ consultations, onViewReport, onNewConsultation }: Props) {
  const getStatusColor = (status: string) => {
    return status === 'completed' ? '#28a745' : '#ffc107';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Consultation History</h2>
        <button onClick={onNewConsultation} style={styles.newButton}>
          + New Consultation
        </button>
      </div>

      {consultations.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <p>No consultations yet</p>
          <button onClick={onNewConsultation} style={styles.emptyButton}>
            Start Your First Consultation
          </button>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Specialist</th>
                <th style={styles.th}>Symptoms</th>
                <th style={styles.th}>Duration</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((consultation) => (
                <tr key={consultation.id} style={styles.tableRow}>
                  <td style={styles.td}>{formatDate(consultation.startedAt)}</td>
                  <td style={styles.td}>
                    <span style={styles.specialistBadge}>
                      {consultation.specialistName || consultation.specialistType}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {consultation.symptoms?.substring(0, 50) || 'No symptoms recorded'}
                    {consultation.symptoms?.length > 50 && '...'}
                  </td>
                  <td style={styles.td}>{formatDuration(consultation.duration)}</td>
                  <td style={styles.td}>
                    <span style={{...styles.statusBadge, backgroundColor: getStatusColor(consultation.status)}}>
                      {consultation.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button 
                      onClick={() => onViewReport(consultation.id)}
                      style={styles.viewButton}
                      disabled={consultation.status !== 'completed'}
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap' as const,
    gap: '10px',
  },
  title: {
    fontSize: '24px',
    color: '#333',
    margin: 0,
  },
  newButton: {
    padding: '10px 20px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  emptyButton: {
    marginTop: '20px',
    padding: '12px 24px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  tableContainer: {
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  tableHeader: {
    background: '#f8f9fa',
  },
  th: {
    padding: '12px',
    textAlign: 'left' as const,
    fontWeight: 'bold',
    color: '#666',
    borderBottom: '2px solid #dee2e6',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #dee2e6',
    color: '#333',
  },
  tableRow: {
    transition: 'background 0.3s',
    cursor: 'pointer',
  },
  specialistBadge: {
    background: '#e7f3ff',
    color: '#0066cc',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    color: 'white',
    textTransform: 'capitalize' as const,
  },
  viewButton: {
    padding: '6px 12px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
};