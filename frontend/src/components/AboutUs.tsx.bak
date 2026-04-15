import { Stethoscope, Mic, Shield, Clock, Award, Users, Heart, Brain, Bone, Baby } from 'lucide-react';

export default function AboutUs() {
  const features = [
    {
      icon: <Mic size={24} />,
      title: 'Voice Consultation',
      description: 'Natural voice interaction with AI doctors for a seamless consultation experience'
    },
    {
      icon: <Stethoscope size={24} />,
      title: 'Multiple Specialists',
      description: 'Access to General Physicians, Orthopedics, Cardiologists, Neurologists & Pediatricians'
    },
    {
      icon: <Shield size={24} />,
      title: 'HIPAA Compliant',
      description: 'Your medical data is encrypted and securely stored with industry-standard protection'
    },
    {
      icon: <Clock size={24} />,
      title: '24/7 Availability',
      description: 'Get medical advice anytime, anywhere - no appointments needed'
    },
    {
      icon: <Award size={24} />,
      title: 'AI-Powered Accuracy',
      description: 'Advanced AI algorithms trained on millions of medical cases'
    },
    {
      icon: <Users size={24} />,
      title: 'Patient-Centered',
      description: 'Designed with patient needs in mind for the best healthcare experience'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '50K+', label: 'Consultations Completed' },
    { value: '24/7', label: 'Support Available' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.badge}>About MediVoice AI</div>
        <h1 style={styles.title}>Revolutionizing Healthcare with <span style={styles.accent}>AI Technology</span></h1>
        <p style={styles.subtitle}>
          MediVoice AI is a cutting-edge healthcare platform that combines artificial intelligence 
          with medical expertise to provide instant, accessible, and accurate medical consultations.
        </p>
      </div>

      <div style={styles.statsSection}>
        {stats.map((stat, index) => (
          <div key={index} style={styles.statCard}>
            <div style={styles.statValue}>{stat.value}</div>
            <div style={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={styles.missionSection}>
        <div style={styles.missionContent}>
          <h2 style={styles.sectionTitle}>Our Mission</h2>
          <p style={styles.missionText}>
            To make quality healthcare accessible to everyone, anytime, anywhere. We believe that 
            technology can bridge the gap between patients and medical expertise, providing timely 
            advice and peace of mind.
          </p>
        </div>
        <div style={styles.missionContent}>
          <h2 style={styles.sectionTitle}>Our Vision</h2>
          <p style={styles.missionText}>
            A world where every person has access to immediate medical guidance, reducing unnecessary 
            hospital visits and empowering individuals to make informed health decisions.
          </p>
        </div>
      </div>

      <div style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>Why Choose MediVoice AI?</h2>
        <div style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} style={styles.featureCard}>
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.specialistsSection}>
        <h2 style={styles.sectionTitle}>Our AI Specialists</h2>
        <div style={styles.specialistsGrid}>
          <div style={styles.specialistCard}>
            <div style={styles.specialistIcon}>👨‍⚕️</div>
            <h4>General Physician</h4>
            <p>Common illnesses, fever, cold, general checkups</p>
          </div>
          <div style={styles.specialistCard}>
            <div style={styles.specialistIcon}>🦴</div>
            <h4>Orthopedic</h4>
            <p>Bone, joint, muscle, back pain issues</p>
          </div>
          <div style={styles.specialistCard}>
            <div style={styles.specialistIcon}>❤️</div>
            <h4>Cardiologist</h4>
            <p>Heart health, blood pressure, chest pain</p>
          </div>
          <div style={styles.specialistCard}>
            <div style={styles.specialistIcon}>🧠</div>
            <h4>Neurologist</h4>
            <p>Headaches, dizziness, nerve problems</p>
          </div>
          <div style={styles.specialistCard}>
            <div style={styles.specialistIcon}>👶</div>
            <h4>Pediatrician</h4>
            <p>Children's health, growth, development</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  hero: {
    textAlign: 'center' as const,
    marginBottom: '60px',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 16px',
    background: '#eff6ff',
    color: '#3b82f6',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '20px',
  },
  title: {
    fontSize: '48px',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '20px',
    lineHeight: 1.2,
  },
  accent: {
    color: '#3b82f6',
  },
  subtitle: {
    fontSize: '18px',
    color: '#64748b',
    maxWidth: '700px',
    margin: '0 auto',
    lineHeight: 1.6,
  },
  statsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
    marginBottom: '60px',
  },
  statCard: {
    textAlign: 'center' as const,
    padding: '24px',
    background: 'white',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#3b82f6',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#64748b',
  },
  missionSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '32px',
    marginBottom: '60px',
    padding: '40px',
    background: 'white',
    borderRadius: '24px',
    border: '1px solid #e5e7eb',
  },
  missionContent: {
    textAlign: 'center' as const,
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '16px',
    textAlign: 'center' as const,
  },
  missionText: {
    fontSize: '16px',
    color: '#64748b',
    lineHeight: 1.6,
  },
  featuresSection: {
    marginBottom: '60px',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginTop: '32px',
  },
  featureCard: {
    padding: '28px',
    background: 'white',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    textAlign: 'center' as const,
    transition: 'all 0.3s ease',
  },
  featureIcon: {
    width: '56px',
    height: '56px',
    background: '#eff6ff',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    color: '#3b82f6',
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '12px',
  },
  featureDescription: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: 1.5,
  },
  specialistsSection: {
    marginBottom: '40px',
  },
  specialistsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '20px',
    marginTop: '32px',
  },
  specialistCard: {
    padding: '24px',
    background: 'white',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    textAlign: 'center' as const,
  },
  specialistIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
};