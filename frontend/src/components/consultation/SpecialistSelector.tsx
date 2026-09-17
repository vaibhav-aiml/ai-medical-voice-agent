import { Specialist } from '../../types/consultation.types';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const specialists: Specialist[] = [
  { id: '1', name: 'Dr. Smith', type: 'general', icon: '👨‍⚕️', description: 'General Physician - For common illnesses, fever, cold, general checkup' },
  { id: '2', name: 'Dr. Johnson', type: 'orthopedic', icon: '🦴', description: 'Orthopedic Specialist - For bone, joint, muscle, back pain issues' },
  { id: '3', name: 'Dr. Williams', type: 'cardiologist', icon: '❤️', description: 'Cardiologist - For heart health, blood pressure, chest pain' },
  { id: '4', name: 'Dr. Brown', type: 'neurologist', icon: '🧠', description: 'Neurologist - For headaches, dizziness, nerve problems' },
  { id: '5', name: 'Dr. Davis', type: 'pediatrician', icon: '👶', description: 'Pediatrician - For children\'s health, growth, development' },
];

interface Props {
  selectedSpecialist: string;
  onSelect: (type: string) => void;
}

export default function SpecialistSelector({ selectedSpecialist, onSelect }: Props) {
  const { isMobile } = useBreakpoint();
  return (
    <div>
      <h3 style={{...styles.title, ...(isMobile ? { fontSize: '18px', marginBottom: '12px' } : {})}}>Select AI Medical Specialist</h3>
      <div style={{...styles.grid, ...(isMobile ? { gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' } : {})}}>
        {specialists.map((specialist) => (
          <div
            key={specialist.id}
            onClick={() => onSelect(specialist.type)}
            style={{
              ...styles.card,
              ...(isMobile ? { padding: '14px 10px' } : {}),
              ...(selectedSpecialist === specialist.type ? styles.selectedCard : {}),
            }}
          >
            <div style={{...styles.icon, ...(isMobile ? { fontSize: '32px', marginBottom: '6px' } : {})}}>{specialist.icon}</div>
            <h4 style={{...styles.name, ...(isMobile ? { fontSize: '14px', marginBottom: '2px' } : {})}}>{specialist.name}</h4>
            <p style={{...styles.type, ...(isMobile ? { fontSize: '12px', marginBottom: '4px' } : {})}}>{specialist.type}</p>
            {!isMobile && <p style={styles.description}>{specialist.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    color: 'var(--text-primary)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  card: {
    background: 'var(--bg-card)',
    padding: '20px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '2px solid var(--border-color)',
    textAlign: 'center' as const,
  },
  selectedCard: {
    border: '2px solid var(--button-primary)',
    background: 'var(--badge-bg)',
    transform: 'scale(1.02)',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '10px',
  },
  name: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '5px',
    color: 'var(--text-primary)',
  },
  type: {
    fontSize: '14px',
    color: 'var(--button-primary)',
    marginBottom: '10px',
    textTransform: 'capitalize' as const,
  },
  description: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
};