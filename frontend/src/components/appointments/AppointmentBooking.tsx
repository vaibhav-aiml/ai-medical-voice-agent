import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { sendAppointmentReminder } from '../../services/whatsapp.service';

interface Props {
  consultationId: string;
  specialistType: string;
  specialistName: string;
  patientName?: string;
  onClose: () => void;
  onBooked: (appointment: any) => void;
}

export default function AppointmentBooking({ 
  consultationId, 
  specialistType, 
  specialistName, 
  patientName = "Patient",
  onClose, 
  onBooked 
}: Props) {
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

    // Send WhatsApp reminder (optional - doesn't block booking)
    try {
      sendAppointmentReminder(
        patientName,
        specialistName,
        selectedDate,
        selectedTime,
        window.location.href
      );
    } catch (error) {
      console.log('WhatsApp reminder not sent:', error);
    }

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
              className="appointment-datepicker"
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
            <p>💚 <strong>WhatsApp:</strong> You'll also receive a reminder on WhatsApp.</p>
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
    background: 'var(--bg-card)',
    borderRadius: '12px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '85vh',
    overflow: 'auto' as const,
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    border: '1px solid var(--border-color)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid var(--border-color)',
  },
  title: {
    margin: 0,
    color: 'var(--text-primary)',
    fontSize: '20px',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  content: {
    padding: '20px',
  },
  infoBox: {
    background: 'var(--badge-bg)',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid var(--border-color)',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '16px',
    background: 'var(--input-bg)',
    color: 'var(--text-primary)',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
    background: 'var(--input-bg)',
    color: 'var(--text-primary)',
  },
  reminderBox: {
    background: 'rgba(59, 130, 246, 0.1)',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '20px',
    fontSize: '13px',
    color: 'var(--text-primary)',
  },
  footer: {
    padding: '20px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  cancelButton: {
    padding: '10px 20px',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
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