import { useState } from 'react';
import { Activity, Brain, Heart, Bone, Baby, Stethoscope, AlertCircle, X, Send } from 'lucide-react';

interface Symptom {
  id: string;
  name: string;
  category: string;
  severity: 'mild' | 'moderate' | 'severe';
}

interface Condition {
  name: string;
  probability: number;
  description: string;
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high';
}

const commonSymptoms: Symptom[] = [
  { id: '1', name: 'Headache', category: 'head', severity: 'moderate' },
  { id: '2', name: 'Fever', category: 'general', severity: 'moderate' },
  { id: '3', name: 'Cough', category: 'respiratory', severity: 'mild' },
  { id: '4', name: 'Sore throat', category: 'throat', severity: 'mild' },
  { id: '5', name: 'Fatigue', category: 'general', severity: 'mild' },
  { id: '6', name: 'Nausea', category: 'stomach', severity: 'moderate' },
  { id: '7', name: 'Back pain', category: 'musculoskeletal', severity: 'moderate' },
  { id: '8', name: 'Chest pain', category: 'chest', severity: 'severe' },
  { id: '9', name: 'Shortness of breath', category: 'respiratory', severity: 'severe' },
  { id: '10', name: 'Dizziness', category: 'head', severity: 'moderate' },
  { id: '11', name: 'Joint pain', category: 'musculoskeletal', severity: 'moderate' },
  { id: '12', name: 'Rash', category: 'skin', severity: 'mild' },
];

const categories = [
  { name: 'All', icon: Activity, color: '#3b82f6' },
  { name: 'Head', icon: Brain, color: '#8b5cf6' },
  { name: 'Chest', icon: Heart, color: '#ef4444' },
  { name: 'Musculoskeletal', icon: Bone, color: '#f59e0b' },
  { name: 'General', icon: Stethoscope, color: '#10b981' },
];

interface Props {
  onClose: () => void;
  onStartConsultation?: (specialistType: string, symptoms: string) => void;
}

export default function SymptomChecker({ onClose, onStartConsultation }: Props) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showResults, setShowResults] = useState(false);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const filteredSymptoms = selectedCategory === 'All' 
    ? commonSymptoms 
    : commonSymptoms.filter(s => s.category === selectedCategory.toLowerCase());

  const toggleSymptom = (symptomName: string) => {
    if (selectedSymptoms.includes(symptomName)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptomName));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptomName]);
    }
  };

  const analyzeSymptoms = () => {
    if (selectedSymptoms.length === 0) {
      alert('Please select at least one symptom');
      return;
    }

    setAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const results = generateAnalysis(selectedSymptoms);
      setConditions(results);
      setShowResults(true);
      setAnalyzing(false);
    }, 2000);
  };

  const generateAnalysis = (symptoms: string[]): Condition[] => {
    const symptomLower = symptoms.map(s => s.toLowerCase());
    
    const possibleConditions: Condition[] = [];
    
    // Headache analysis
    if (symptomLower.includes('headache')) {
      if (symptomLower.includes('dizziness')) {
        possibleConditions.push({
          name: 'Migraine',
          probability: 75,
          description: 'Migraines often cause throbbing pain on one side of the head, accompanied by dizziness and sensitivity to light.',
          recommendations: [
            'Rest in a dark, quiet room',
            'Apply cold compress to forehead',
            'Stay hydrated',
            'Consider over-the-counter pain relievers',
          ],
          urgency: 'low',
        });
      } else {
        possibleConditions.push({
          name: 'Tension Headache',
          probability: 65,
          description: 'Tension headaches cause mild to moderate pain that feels like a tight band around the head.',
          recommendations: [
            'Practice stress reduction techniques',
            'Apply warm compress to neck',
            'Take over-the-counter pain relievers',
            'Ensure proper hydration',
          ],
          urgency: 'low',
        });
      }
    }
    
    // Fever analysis
    if (symptomLower.includes('fever')) {
      if (symptomLower.includes('cough') || symptomLower.includes('sore throat')) {
        possibleConditions.push({
          name: 'Viral Infection',
          probability: 80,
          description: 'Common viral infection causing fever, cough, and throat discomfort.',
          recommendations: [
            'Get plenty of rest',
            'Stay hydrated with warm fluids',
            'Take fever-reducing medication',
            'Monitor temperature every 4-6 hours',
          ],
          urgency: 'low',
        });
      } else {
        possibleConditions.push({
          name: 'Flu-like Illness',
          probability: 60,
          description: 'Fever accompanied by general malaise and body aches.',
          recommendations: [
            'Rest and recover',
            'Increase fluid intake',
            'Take fever reducers as needed',
            'Consult doctor if fever exceeds 103°F',
          ],
          urgency: 'medium',
        });
      }
    }
    
    // Chest pain analysis
    if (symptomLower.includes('chest pain')) {
      possibleConditions.push({
        name: '⚠️ Potential Cardiac Concern',
        probability: 85,
        description: 'Chest pain requires immediate medical attention. This could indicate a serious condition.',
        recommendations: [
          'SEEK IMMEDIATE MEDICAL ATTENTION',
          'Call emergency services',
          'Do not drive yourself to the hospital',
          'Chew an aspirin if not allergic',
        ],
        urgency: 'high',
      });
    }
    
    // Back pain analysis
    if (symptomLower.includes('back pain')) {
      possibleConditions.push({
        name: 'Muscle Strain',
        probability: 70,
        description: 'Lower back pain often results from muscle strain due to poor posture or overexertion.',
        recommendations: [
          'Apply ice for first 48 hours',
          'Rest and avoid heavy lifting',
          'Gentle stretching exercises',
          'Consider over-the-counter anti-inflammatory medication',
        ],
        urgency: 'low',
      });
    }
    
    // Shortness of breath
    if (symptomLower.includes('shortness of breath')) {
      possibleConditions.push({
        name: '⚠️ Respiratory Concern',
        probability: 90,
        description: 'Shortness of breath requires prompt medical evaluation.',
        recommendations: [
          'Seek medical attention promptly',
          'Monitor oxygen levels if possible',
          'Avoid strenuous activity',
          'Contact your healthcare provider',
        ],
        urgency: 'high',
      });
    }
    
    // Joint pain analysis
    if (symptomLower.includes('joint pain')) {
      possibleConditions.push({
        name: 'Joint Inflammation',
        probability: 65,
        description: 'Joint pain may indicate inflammation or early arthritis.',
        recommendations: [
          'Apply ice to affected joints',
          'Gentle range-of-motion exercises',
          'Consider anti-inflammatory medication',
          'Consult rheumatologist if persistent',
        ],
        urgency: 'low',
      });
    }
    
    // If no specific condition matched
    if (possibleConditions.length === 0) {
      possibleConditions.push({
        name: 'General Symptoms',
        probability: 50,
        description: 'Your symptoms are non-specific. Monitor your condition and consult a doctor if symptoms persist.',
        recommendations: [
          'Get adequate rest',
          'Stay hydrated',
          'Monitor symptoms for 24-48 hours',
          'Consult doctor if symptoms worsen',
        ],
        urgency: 'low',
      });
    }
    
    return possibleConditions.slice(0, 3);
  };

  const getUrgencyColor = (urgency: string) => {
    switch(urgency) {
      case 'high': return '#dc2626';
      case 'medium': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch(urgency) {
      case 'high': return '⚠️ Seek Immediate Care';
      case 'medium': return '📅 See Doctor Soon';
      default: return '💚 Home Care Recommended';
    }
  };

  const handleStartConsultation = () => {
    const symptomsText = selectedSymptoms.join(', ');
    let specialistType = 'general';
    
    if (selectedSymptoms.some(s => s.toLowerCase().includes('back') || s.toLowerCase().includes('joint'))) {
      specialistType = 'orthopedic';
    } else if (selectedSymptoms.some(s => s.toLowerCase().includes('chest') || s.toLowerCase().includes('heart'))) {
      specialistType = 'cardiologist';
    } else if (selectedSymptoms.some(s => s.toLowerCase().includes('headache') || s.toLowerCase().includes('dizzy'))) {
      specialistType = 'neurologist';
    }
    
    if (onStartConsultation) {
      onStartConsultation(specialistType, symptomsText);
    }
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <Activity size={24} />
          </div>
          <h2 style={styles.title}>Symptom Checker Bot</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        {!showResults ? (
          <div style={styles.content}>
            <p style={styles.description}>
              Select your symptoms to get a preliminary analysis. This tool provides general information only.
            </p>

            <div style={styles.categorySection}>
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  style={{
                    ...styles.categoryButton,
                    ...(selectedCategory === category.name ? styles.categoryButtonActive : {}),
                  }}
                >
                  <category.icon size={18} color={category.color} />
                  <span>{category.name}</span>
                </button>
              ))}
            </div>

            <div style={styles.symptomsGrid}>
              {filteredSymptoms.map((symptom) => (
                <button
                  key={symptom.id}
                  onClick={() => toggleSymptom(symptom.name)}
                  style={{
                    ...styles.symptomButton,
                    ...(selectedSymptoms.includes(symptom.name) ? styles.symptomButtonSelected : {}),
                  }}
                >
                  {symptom.name}
                </button>
              ))}
            </div>

            <div style={styles.selectedSection}>
              <h4>Selected Symptoms ({selectedSymptoms.length})</h4>
              <div style={styles.selectedSymptoms}>
                {selectedSymptoms.map(symptom => (
                  <span key={symptom} style={styles.selectedBadge}>
                    {symptom}
                    <button onClick={() => toggleSymptom(symptom)} style={styles.removeButton}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <button 
              onClick={analyzeSymptoms}
              style={styles.analyzeButton}
              disabled={analyzing || selectedSymptoms.length === 0}
            >
              {analyzing ? (
                <>🤖 Analyzing your symptoms...</>
              ) : (
                <>🔍 Analyze Symptoms</>
              )}
            </button>
          </div>
        ) : (
          <div style={styles.resultsContent}>
            <div style={styles.resultsHeader}>
              <h3>📊 Analysis Results</h3>
              <p>Based on your {selectedSymptoms.length} selected symptoms</p>
            </div>

            {conditions.map((condition, index) => (
              <div key={index} style={styles.conditionCard}>
                <div style={styles.conditionHeader}>
                  <div>
                    <h4>{condition.name}</h4>
                    <div style={styles.probabilityBar}>
                      <div style={{...styles.probabilityFill, width: `${condition.probability}%`}} />
                    </div>
                    <span style={styles.probabilityText}>{condition.probability}% match</span>
                  </div>
                  <span style={{...styles.urgencyBadge, backgroundColor: getUrgencyColor(condition.urgency)}}>
                    {getUrgencyText(condition.urgency)}
                  </span>
                </div>
                <p style={styles.conditionDescription}>{condition.description}</p>
                <div style={styles.recommendations}>
                  <strong>Recommendations:</strong>
                  <ul>
                    {condition.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            <div style={styles.disclaimer}>
              <AlertCircle size={16} />
              <p>This is an AI-generated analysis for informational purposes only. Not a medical diagnosis. Always consult a qualified healthcare provider.</p>
            </div>

            <div style={styles.resultsFooter}>
              <button onClick={() => setShowResults(false)} style={styles.backButton}>
                ← Back to Symptoms
              </button>
              <button onClick={handleStartConsultation} style={styles.consultButton}>
                Start Full Consultation →
              </button>
            </div>
          </div>
        )}
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
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'var(--bg-card)',
    borderRadius: '24px',
    maxWidth: '700px',
    width: '90%',
    maxHeight: '85vh',
    overflow: 'auto' as const,
    boxShadow: '0 20px 35px -10px rgba(0,0,0,0.2)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 24px',
    background: 'linear-gradient(135deg, var(--button-primary), #2563eb)',
    color: 'white',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },
  headerIcon: {
    width: '36px',
    height: '36px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '20px',
    fontWeight: 600,
    margin: 0,
    flex: 1,
  },
  closeButton: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: 'white',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: '24px',
  },
  description: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '20px',
    lineHeight: 1.5,
  },
  categorySection: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap' as const,
  },
  categoryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'var(--badge-bg)',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  categoryButtonActive: {
    background: 'var(--button-primary)',
    color: 'white',
  },
  symptomsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '10px',
    marginBottom: '24px',
  },
  symptomButton: {
    padding: '10px',
    background: 'var(--badge-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    color: 'var(--text-primary)',
    transition: 'all 0.2s ease',
  },
  symptomButtonSelected: {
    background: 'var(--button-primary)',
    color: 'white',
    borderColor: 'var(--button-primary)',
  },
  selectedSection: {
    marginBottom: '24px',
  },
  selectedSymptoms: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    marginTop: '10px',
  },
  selectedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: 'var(--button-primary)',
    color: 'white',
    borderRadius: '20px',
    fontSize: '13px',
  },
  removeButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0 4px',
  },
  analyzeButton: {
    width: '100%',
    padding: '14px',
    background: 'var(--button-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 500,
  },
  resultsContent: {
    padding: '24px',
  },
  resultsHeader: {
    marginBottom: '20px',
  },
  conditionCard: {
    background: 'var(--badge-bg)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
    border: '1px solid var(--border-color)',
  },
  conditionHeader: {
    marginBottom: '12px',
  },
  probabilityBar: {
    height: '6px',
    background: 'var(--border-color)',
    borderRadius: '3px',
    margin: '8px 0 4px',
    overflow: 'hidden',
  },
  probabilityFill: {
    height: '100%',
    background: 'var(--button-primary)',
    borderRadius: '3px',
  },
  probabilityText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  urgencyBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
    color: 'white',
    marginTop: '8px',
  },
  conditionDescription: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    marginBottom: '12px',
  },
  recommendations: {
    fontSize: '14px',
    color: 'var(--text-primary)',
  },
  disclaimer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    background: 'var(--badge-bg)',
    borderRadius: '10px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '20px',
  },
  resultsFooter: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
  },
  backButton: {
    flex: 1,
    padding: '12px',
    background: 'var(--badge-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'var(--text-primary)',
  },
  consultButton: {
    flex: 1,
    padding: '12px',
    background: 'var(--button-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  },
};