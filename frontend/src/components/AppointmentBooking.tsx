import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Props {
  consultationId: string;
  specialistType: string;
  specialistName: string;
  onClose: () => void;
  onBooked: (appointment: any) => void;
}

export default function AppointmentBooking({ consultationId, specialistType, specialistName, onClose, onBooked }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select date and time');
      return;
    }

    setIsSubmitting(true);

    const appointment = {
      id: `apt_${Date.now()}`,
      consultationId,
      specialistType,
      specialistName,
      date: selectedDate,
      time: selectedTime,
      reason: reason || 'Follow-up consultation',
      status: 'scheduled',
      bookedAt: new Date(),
    };

    // Save to localStorage
    const existing = localStorage.getItem('appointments');
    const appointments = existing ? JSON.parse(existing) : [];
    appointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));

    // Also save with user ID
    const userId = localStorage.getItem('userId') || 'user';
    const userAppointments = localStorage.getItem(`appointments_${userId}`);
    const userApps = userAppointments ? JSON.parse(userAppointments) : [];
    userApps.push(appointment);
    localStorage.setItem(`appointments_${userId}`, JSON.stringify(userApps));

    setTimeout(() => {
      setIsSubmitting(false);
      onBooked(appointment);
      alert(`✅ Appointment booked for ${selectedDate.toLocaleDateString()} at ${selectedTime}`);
      onClose();
    }, 1000);
  };

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>📅 Book Follow-up Appointment</h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        <div style={styles.content}>
          <div style={styles.infoBox}>
            <p><strong>Specialist:</strong> {specialistName}</p>
            <p><strong>Type:</strong> {specialistType}</p>
            <p><strong>Consultation ID:</strong> {consultationId}</p>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Select Date:</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => setSelectedDate(date)}
              minDate={minDate}
              maxDate={maxDate}
              dateFormat="MMMM d, yyyy"
              placeholderText="Choose a date"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Select Time:</label>
            <select 
              value={selectedTime} 
              onChange={(e) => setSelectedTime(e.target.value)}
              style={styles.select}
            >
              <option value="">Select time slot</option>
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Reason for follow-up (optional):</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Persistent symptoms, need medication refill, etc."
              style={styles.textarea}
              rows={3}
            />
          </div>

          <div style={styles.reminderBox}>
            <p>📧 <strong>Reminder:</strong> You will receive an email reminder 24 hours before your appointment.</p>
            <p>⏰ Please arrive 10 minutes early for your appointment.</p>
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>
          <button 
            onClick={handleBookAppointment}
            style={styles.bookButton}
            disabled={!selectedDate || !selectedTime || isSubmitting}
          >
            {isSubmitting ? 'Booking...' : '📅 Book Appointment'}
          </button>
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '85vh',
    overflow: 'auto' as const,
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #eee',
  },
  title: {
    margin: 0,
    color: '#333',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#999',
  },
  content: {
    padding: '20px',
  },
  infoBox: {
    background: '#e8f5e9',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#333',
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    background: 'white',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
  },
  reminderBox: {
    background: '#fff3e0',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '20px',
    fontSize: '13px',
  },
  footer: {
    padding: '20px',
    borderTop: '1px solid #eee',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  cancelButton: {
    padding: '10px 20px',
    background: '#f0f0f0',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  bookButton: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};