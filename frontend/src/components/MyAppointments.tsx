import { useState, useEffect } from 'react';

interface Appointment {
  id: string;
  consultationId: string;
  specialistType: string;
  specialistName: string;
  date: Date;
  time: string;
  reason: string;
  status: string;
  bookedAt: Date;
}

interface Props {
  onCancel?: (appointmentId: string) => void;
}

export default function MyAppointments({ onCancel }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = () => {
    const userId = localStorage.getItem('userId') || 'user';
    const saved = localStorage.getItem(`appointments_${userId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      const formatted = parsed.map((apt: any) => ({
        ...apt,
        date: new Date(apt.date),
        bookedAt: new Date(apt.bookedAt),
      }));
      setAppointments(formatted);
    }
    setLoading(false);
  };

  const cancelAppointment = (appointmentId: string) => {
    const userId = localStorage.getItem('userId') || 'user';
    const updated = appointments.filter(a => a.id !== appointmentId);
    setAppointments(updated);
    localStorage.setItem(`appointments_${userId}`, JSON.stringify(updated));
    if (onCancel) onCancel(appointmentId);
    alert('Appointment cancelled successfully');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'scheduled': return '#ffc107';
      case 'completed': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading appointments...</div>;
  }

  if (appointments.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>📅</div>
        <h3>No Appointments Yet</h3>
        <p>Book a follow-up appointment after your consultation</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>My Appointments</h2>
      <div style={styles.appointmentsList}>
        {appointments.map((apt) => (
          <div key={apt.id} style={styles.appointmentCard}>
            <div style={styles.cardHeader}>
              <span style={styles.specialistIcon}>👨‍⚕️</span>
              <div>
                <h3 style={styles.specialistName}>{apt.specialistName}</h3>
                <p style={styles.specialistType}>{apt.specialistType}</p>
              </div>
              <span style={{...styles.statusBadge, backgroundColor: getStatusColor(apt.status)}}>
                {apt.status}
              </span>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.detailRow}>
                <span>📅 Date:</span>
                <strong>{apt.date.toLocaleDateString()}</strong>
              </div>
              <div style={styles.detailRow}>
                <span>⏰ Time:</span>
                <strong>{apt.time}</strong>
              </div>
              <div style={styles.detailRow}>
                <span>📝 Reason:</span>
                <strong>{apt.reason}</strong>
              </div>
              <div style={styles.detailRow}>
                <span>🆔 Consultation:</span>
                <strong>{apt.consultationId.substring(0, 20)}...</strong>
              </div>
            </div>
            {apt.status === 'scheduled' && (
              <button 
                onClick={() => cancelAppointment(apt.id)}
                style={styles.cancelButton}
              >
                Cancel Appointment
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#666',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  appointmentsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  },
  appointmentCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #eee',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid #eee',
  },
  specialistIcon: {
    fontSize: '32px',
  },
  specialistName: {
    margin: 0,
    fontSize: '18px',
    color: '#333',
  },
  specialistType: {
    margin: '5px 0 0',
    fontSize: '12px',
    color: '#666',
    textTransform: 'capitalize' as const,
  },
  statusBadge: {
    marginLeft: 'auto',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    color: 'white',
    textTransform: 'capitalize' as const,
  },
  cardBody: {
    marginBottom: '15px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  cancelButton: {
    width: '100%',
    padding: '10px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};