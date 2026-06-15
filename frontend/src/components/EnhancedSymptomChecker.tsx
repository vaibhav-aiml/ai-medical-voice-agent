import React, { useState } from 'react';
import { Activity, AlertCircle, CheckCircle, Clock, Heart, Brain, Stethoscope, Pill, TrendingUp, AlertTriangle, Shield, Plus, Trash2 } from 'lucide-react';

interface Symptom {
  id: string;
  name: string;
  duration: string;
  severity: 'mild' | 'moderate' | 'severe';
  location?: string;
}

interface PatientInfo {
  age: number;
  gender: 'male' | 'female' | 'other';
  medicalHistory: string[];
  medications: string[];
  allergies: string[];
  smoking: boolean;
  alcohol: boolean;
  stress: 'low' | 'medium' | 'high';
  sleep: number;
  familyHistory: string[];
}

interface DifferentialDiagnosis {
  condition: string;
  probability: number;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  supportingSymptoms: string[];
  requiredTests?: string[];
}

interface AnalysisResult {
  primaryDiagnosis: string;
  differentialDiagnoses: DifferentialDiagnosis[];
  urgencyLevel: 'routine' | 'consult_48h' | 'consult_24h' | 'emergency';
  recommendations: string[];
  selfCare: string[];
  whenToSeeDoctor: string;
  riskAssessment?: {
    condition: string;
    riskScore: number;
    riskLevel: 'low' | 'moderate' | 'high' | 'critical';
    factors: string[];
    recommendations: string[];
    screeningFrequency: string;
    nextSteps: string[];
  };
  specialistReferral?: string;
}

const EnhancedSymptomChecker: React.FC<{ onClose: () => void; onStartConsultation?: (specialist: string, symptoms: string) => void }> = ({ onClose, onStartConsultation }) => {
  const [step, setStep] = useState<'symptoms' | 'patient' | 'results'>('symptoms');
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [currentDuration, setCurrentDuration] = useState('');
  const [currentSeverity, setCurrentSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    age: 30,
    gender: 'male',
    medicalHistory: [],
    medications: [],
    allergies: [],
    smoking: false,
    alcohol: false,
    stress: 'medium',
    sleep: 7,
    familyHistory: [],
  });
  const [currentMedication, setCurrentMedication] = useState('');
  const [currentCondition, setCurrentCondition] = useState('');
  const [currentFamilyCondition, setCurrentFamilyCondition] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'recommendations' | 'risk'>('diagnosis');

  const addSymptom = () => {
    if (currentSymptom.trim()) {
      setSymptoms([
        ...symptoms,
        {
          id: Date.now().toString(),
          name: currentSymptom,
          duration: currentDuration,
          severity: currentSeverity,
        },
      ]);
      setCurrentSymptom('');
      setCurrentDuration('');
      setCurrentSeverity('mild');
    }
  };

  const removeSymptom = (id: string) => {
    setSymptoms(symptoms.filter(s => s.id !== id));
  };

  const addMedicalHistory = () => {
    if (currentCondition.trim()) {
      setPatientInfo({
        ...patientInfo,
        medicalHistory: [...patientInfo.medicalHistory, currentCondition],
      });
      setCurrentCondition('');
    }
  };

  const removeMedicalHistory = (condition: string) => {
    setPatientInfo({
      ...patientInfo,
      medicalHistory: patientInfo.medicalHistory.filter(c => c !== condition),
    });
  };

  const addMedication = () => {
    if (currentMedication.trim()) {
      setPatientInfo({
        ...patientInfo,
        medications: [...patientInfo.medications, currentMedication],
      });
      setCurrentMedication('');
    }
  };

  const removeMedication = (med: string) => {
    setPatientInfo({
      ...patientInfo,
      medications: patientInfo.medications.filter(m => m !== med),
    });
  };

  const addFamilyHistory = () => {
    if (currentFamilyCondition.trim()) {
      setPatientInfo({
        ...patientInfo,
        familyHistory: [...patientInfo.familyHistory, currentFamilyCondition],
      });
      setCurrentFamilyCondition('');
    }
  };

  const removeFamilyHistory = (condition: string) => {
    setPatientInfo({
      ...patientInfo,
      familyHistory: patientInfo.familyHistory.filter(c => c !== condition),
    });
  };

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) {
      alert('Please add at least one symptom');
      return;
    }

    setLoading(true);
    try {
      const durations: Record<string, string> = {};
      const severities: Record<string, string> = {};
      symptoms.forEach(s => {
        durations[s.name] = s.duration;
        severities[s.name] = s.severity;
      });

      const response = await fetch('/api/enhanced-symptom/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: symptoms.map(s => s.name),
          durations,
          severities,
          patientProfile: {
            age: patientInfo.age,
            gender: patientInfo.gender,
            medicalHistory: patientInfo.medicalHistory,
            medications: patientInfo.medications,
            allergies: patientInfo.allergies,
            lifestyle: {
              smoking: patientInfo.smoking,
              alcohol: patientInfo.alcohol,
              stress: patientInfo.stress,
              sleep: patientInfo.sleep,
            },
            familyHistory: patientInfo.familyHistory,
          },
        }),
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
        setStep('results');
      }
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      alert('Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'emergency': return { bg: '#dc2626', text: 'white', icon: '🚨' };
      case 'consult_24h': return { bg: '#ea580c', text: 'white', icon: '🟠' };
      case 'consult_48h': return { bg: '#ca8a04', text: 'white', icon: '🟡' };
      default: return { bg: '#10b981', text: 'white', icon: '🟢' };
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'moderate': return '#ca8a04';
      default: return '#10b981';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      default: return '#ef4444';
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <Activity size={24} style={styles.headerIcon} />
            <div>
              <h2 style={styles.title}>AI Symptom Checker</h2>
              <p style={styles.subtitle}>Advanced symptom analysis with differential diagnosis</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        {step === 'symptoms' && (
          <div style={styles.content}>
            {/* Symptoms Section */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Add Your Symptoms</h3>
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Symptom (e.g., headache, fever, cough)"
                  value={currentSymptom}
                  onChange={(e) => setCurrentSymptom(e.target.value)}
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="Duration (e.g., 2 days, 1 week)"
                  value={currentDuration}
                  onChange={(e) => setCurrentDuration(e.target.value)}
                  style={styles.inputSmall}
                />
                <select
                  value={currentSeverity}
                  onChange={(e) => setCurrentSeverity(e.target.value as any)}
                  style={styles.select}
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
                <button onClick={addSymptom} style={styles.addBtn}>
                  <Plus size={16} /> Add
                </button>
              </div>
              <div style={styles.symptomsList}>
                {symptoms.map(s => (
                  <div key={s.id} style={styles.symptomTag}>
                    <span style={styles.symptomName}>{s.name}</span>
                    <span style={styles.symptomDetail}>{s.duration || '?'}</span>
                    <span style={{ ...styles.symptomSeverity, background: s.severity === 'severe' ? '#fee2e2' : s.severity === 'moderate' ? '#ffedd5' : '#dcfce7', color: s.severity === 'severe' ? '#dc2626' : s.severity === 'moderate' ? '#ea580c' : '#10b981' }}>
                      {s.severity}
                    </span>
                    <button onClick={() => removeSymptom(s.id)} style={styles.removeBtn}>×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Common Symptoms */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Quick Add Common Symptoms</h3>
              <div style={styles.commonSymptoms}>
                {['Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea', 'Chest Pain', 'Shortness of Breath', 'Joint Pain', 'Sore Throat', 'Dizziness'].map(symptom => (
                  <button
                    key={symptom}
                    onClick={() => {
                      if (!symptoms.find(s => s.name === symptom.toLowerCase())) {
                        setSymptoms([...symptoms, { id: Date.now().toString(), name: symptom.toLowerCase(), duration: '', severity: 'mild' }]);
                      }
                    }}
                    style={styles.commonSymptomBtn}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            {/* Patient Profile Section */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Patient Profile</h3>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Age</label>
                  <input type="number" value={patientInfo.age} onChange={(e) => setPatientInfo({ ...patientInfo, age: parseInt(e.target.value) })} style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Gender</label>
                  <select value={patientInfo.gender} onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value as any })} style={styles.select}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Medical History</label>
                  <div style={styles.inputWithButton}>
                    <input type="text" placeholder="e.g., diabetes, hypertension" value={currentCondition} onChange={(e) => setCurrentCondition(e.target.value)} style={styles.input} />
                    <button onClick={addMedicalHistory} style={styles.smallAddBtn}>Add</button>
                  </div>
                  <div style={styles.tagsList}>
                    {patientInfo.medicalHistory.map(cond => (
                      <span key={cond} style={styles.tag}>
                        {cond}
                        <button onClick={() => removeMedicalHistory(cond)} style={styles.tagRemove}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Current Medications</label>
                  <div style={styles.inputWithButton}>
                    <input type="text" placeholder="e.g., Metformin, Lisinopril" value={currentMedication} onChange={(e) => setCurrentMedication(e.target.value)} style={styles.input} />
                    <button onClick={addMedication} style={styles.smallAddBtn}>Add</button>
                  </div>
                  <div style={styles.tagsList}>
                    {patientInfo.medications.map(med => (
                      <span key={med} style={styles.tag}>
                        {med}
                        <button onClick={() => removeMedication(med)} style={styles.tagRemove}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Family History</label>
                  <div style={styles.inputWithButton}>
                    <input type="text" placeholder="e.g., heart disease, diabetes" value={currentFamilyCondition} onChange={(e) => setCurrentFamilyCondition(e.target.value)} style={styles.input} />
                    <button onClick={addFamilyHistory} style={styles.smallAddBtn}>Add</button>
                  </div>
                  <div style={styles.tagsList}>
                    {patientInfo.familyHistory.map(cond => (
                      <span key={cond} style={styles.tag}>
                        {cond}
                        <button onClick={() => removeFamilyHistory(cond)} style={styles.tagRemove}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Lifestyle</label>
                  <div style={styles.checkboxGroup}>
                    <label style={styles.checkboxLabel}>
                      <input type="checkbox" checked={patientInfo.smoking} onChange={(e) => setPatientInfo({ ...patientInfo, smoking: e.target.checked })} />
                      Smoking
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input type="checkbox" checked={patientInfo.alcohol} onChange={(e) => setPatientInfo({ ...patientInfo, alcohol: e.target.checked })} />
                      Alcohol
                    </label>
                  </div>
                  <div style={styles.formRowSmall}>
                    <select value={patientInfo.stress} onChange={(e) => setPatientInfo({ ...patientInfo, stress: e.target.value as any })} style={styles.select}>
                      <option value="low">Low Stress</option>
                      <option value="medium">Medium Stress</option>
                      <option value="high">High Stress</option>
                    </select>
                    <input type="number" placeholder="Hours of sleep" value={patientInfo.sleep} onChange={(e) => setPatientInfo({ ...patientInfo, sleep: parseInt(e.target.value) })} style={styles.inputSmall} />
                  </div>
                </div>
              </div>
            </div>

            <button onClick={analyzeSymptoms} disabled={loading || symptoms.length === 0} style={styles.analyzeBtn}>
              {loading ? 'Analyzing...' : 'Analyze Symptoms'}
            </button>
          </div>
        )}

        {step === 'results' && result && (
          <div style={styles.resultsContent}>
            {/* Urgency Banner */}
            <div style={{ ...styles.urgencyBanner, background: getUrgencyColor(result.urgencyLevel).bg }}>
              <span style={styles.urgencyIcon}>{getUrgencyColor(result.urgencyLevel).icon}</span>
              <div>
                <div style={styles.urgencyTitle}>
                  {result.urgencyLevel === 'emergency' && 'EMERGENCY - Seek Immediate Care'}
                  {result.urgencyLevel === 'consult_24h' && 'URGENT - See Doctor Within 24 Hours'}
                  {result.urgencyLevel === 'consult_48h' && 'Schedule Appointment Within 48 Hours'}
                  {result.urgencyLevel === 'routine' && 'Routine - Monitor Symptoms'}
                </div>
                <div style={styles.urgencyMessage}>{result.whenToSeeDoctor}</div>
              </div>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
              <button onClick={() => setActiveTab('diagnosis')} style={{ ...styles.tab, ...(activeTab === 'diagnosis' ? styles.activeTab : {}) }}>
                <Brain size={16} /> Diagnosis
              </button>
              <button onClick={() => setActiveTab('recommendations')} style={{ ...styles.tab, ...(activeTab === 'recommendations' ? styles.activeTab : {}) }}>
                <Pill size={16} /> Recommendations
              </button>
              {result.riskAssessment && (
                <button onClick={() => setActiveTab('risk')} style={{ ...styles.tab, ...(activeTab === 'risk' ? styles.activeTab : {}) }}>
                  <TrendingUp size={16} /> Risk Assessment
                </button>
              )}
            </div>

            {activeTab === 'diagnosis' && (
              <div style={styles.diagnosisSection}>
                {/* Primary Diagnosis */}
                <div style={styles.primaryDiagnosis}>
                  <h3>Primary Diagnosis</h3>
                  <div style={styles.diagnosisName}>{result.primaryDiagnosis}</div>
                  {result.specialistReferral && (
                    <div style={styles.specialistNote}>
                      <Stethoscope size={16} />
                      <span>Consider consulting a {result.specialistReferral}</span>
                    </div>
                  )}
                </div>

                {/* Differential Diagnoses */}
                <h3 style={styles.sectionTitle}>Differential Diagnoses</h3>
                <div style={styles.differentialList}>
                  {result.differentialDiagnoses.map((diag, idx) => (
                    <div key={idx} style={styles.differentialCard}>
                      <div style={styles.differentialHeader}>
                        <div style={styles.differentialName}>{diag.condition}</div>
                        <div style={styles.probabilityBar}>
                          <div style={{ ...styles.probabilityFill, width: `${diag.probability}%`, background: getConfidenceColor(diag.confidence) }} />
                          <span style={styles.probabilityText}>{diag.probability}%</span>
                        </div>
                      </div>
                      <div style={styles.differentialConfidence}>
                        <span style={{ ...styles.confidenceBadge, background: getConfidenceColor(diag.confidence) }}>
                          {diag.confidence.toUpperCase()} confidence
                        </span>
                      </div>
                      <p style={styles.differentialReasoning}>{diag.reasoning}</p>
                      <div style={styles.supportingSymptoms}>
                        <strong>Supporting symptoms:</strong> {diag.supportingSymptoms.join(', ')}
                      </div>
                      {diag.requiredTests && diag.requiredTests.length > 0 && (
                        <div style={styles.requiredTests}>
                          <strong>Suggested tests:</strong> {diag.requiredTests.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'recommendations' && (
              <div style={styles.recommendationsSection}>
                <div style={styles.recommendationsCard}>
                  <h3><CheckCircle size={18} /> Medical Recommendations</h3>
                  <ul style={styles.recommendationsList}>
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>

                <div style={styles.selfCareCard}>
                  <h3><Heart size={18} /> Self-Care Tips</h3>
                  <ul style={styles.recommendationsList}>
                    {result.selfCare.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>

                {result.urgencyLevel !== 'emergency' && (
                  <button
                    onClick={() => {
                      onStartConsultation?.(result.primaryDiagnosis.includes('Cardiologist') ? 'cardiologist' : 'general', symptoms.map(s => s.name).join(', '));
                      onClose();
                    }}
                    style={styles.consultBtn}
                  >
                    Start AI Consultation
                  </button>
                )}
              </div>
            )}

            {activeTab === 'risk' && result.riskAssessment && (
              <div style={styles.riskSection}>
                <div style={{ ...styles.riskCard, borderColor: getRiskLevelColor(result.riskAssessment.riskLevel) }}>
                  <div style={styles.riskHeader}>
                    <AlertTriangle size={24} color={getRiskLevelColor(result.riskAssessment.riskLevel)} />
                    <div>
                      <div style={styles.riskTitle}>Chronic Disease Risk Assessment</div>
                      <div style={styles.riskCondition}>{result.riskAssessment.condition}</div>
                    </div>
                    <div style={{ ...styles.riskScore, background: getRiskLevelColor(result.riskAssessment.riskLevel) }}>
                      {result.riskAssessment.riskScore}
                    </div>
                  </div>
                  <div style={styles.riskLevel}>
                    Risk Level: <strong style={{ color: getRiskLevelColor(result.riskAssessment.riskLevel) }}>{result.riskAssessment.riskLevel.toUpperCase()}</strong>
                  </div>
                  <div style={styles.riskFactors}>
                    <strong>Risk Factors Identified:</strong>
                    <ul>
                      {result.riskAssessment.factors.map((factor, idx) => (
                        <li key={idx}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={styles.riskRecommendations}>
                    <strong>Recommendations:</strong>
                    <ul>
                      {result.riskAssessment.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={styles.riskNextSteps}>
                    <strong>Screening Frequency:</strong> {result.riskAssessment.screeningFrequency}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

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
    padding: '20px',
  },
  modal: {
    background: 'var(--bg-card)',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    overflow: 'auto' as const,
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid var(--border-color)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerIcon: {
    color: '#3b82f6',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  content: {
    padding: '24px',
  },
  section: {
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid var(--border-color)',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '16px',
  },
  inputGroup: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap' as const,
  },
  input: {
    flex: 2,
    padding: '10px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    background: 'var(--input-bg)',
    color: 'var(--text-primary)',
  },
  inputSmall: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    background: 'var(--input-bg)',
    color: 'var(--text-primary)',
  },
  select: {
    padding: '10px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    background: 'var(--input-bg)',
    color: 'var(--text-primary)',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  symptomsList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '10px',
  },
  symptomTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    background: 'var(--bg-secondary)',
    borderRadius: '20px',
    fontSize: '13px',
  },
  symptomName: {
    fontWeight: 500,
  },
  symptomDetail: {
    color: 'var(--text-secondary)',
    fontSize: '11px',
  },
  symptomSeverity: {
    padding: '2px 6px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: 500,
  },
  removeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    color: 'var(--text-secondary)',
  },
  commonSymptoms: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
  },
  commonSymptomBtn: {
    padding: '6px 12px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '12px',
    color: 'var(--text-primary)',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  formRowSmall: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  inputWithButton: {
    display: 'flex',
    gap: '8px',
  },
  smallAddBtn: {
    padding: '8px 16px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  tagsList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    marginTop: '8px',
  },
  tag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    background: 'rgba(59,130,246,0.1)',
    borderRadius: '16px',
    fontSize: '12px',
    color: '#3b82f6',
  },
  tagRemove: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#3b82f6',
  },
  checkboxGroup: {
    display: 'flex',
    gap: '16px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  analyzeBtn: {
    width: '100%',
    padding: '14px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
  },
  resultsContent: {
    padding: '24px',
  },
  urgencyBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '24px',
  },
  urgencyIcon: {
    fontSize: '32px',
  },
  urgencyTitle: {
    fontSize: '16px',
    fontWeight: 700,
    marginBottom: '4px',
  },
  urgencyMessage: {
    fontSize: '13px',
    opacity: 0.9,
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '1px solid var(--border-color)',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  activeTab: {
    background: 'rgba(59,130,246,0.1)',
    color: '#3b82f6',
  },
  diagnosisSection: {
    maxHeight: '500px',
    overflow: 'auto' as const,
  },
  primaryDiagnosis: {
    background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
    padding: '20px',
    borderRadius: '16px',
    marginBottom: '24px',
  },
  diagnosisName: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#3b82f6',
    marginTop: '8px',
  },
  specialistNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
    padding: '8px 12px',
    background: 'rgba(245,158,11,0.1)',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#f59e0b',
  },
  differentialList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  differentialCard: {
    padding: '16px',
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
  },
  differentialHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    flexWrap: 'wrap' as const,
    gap: '12px',
  },
  differentialName: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  probabilityBar: {
    position: 'relative' as const,
    width: '120px',
    height: '24px',
    background: 'var(--bg-card)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  probabilityFill: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: '12px',
  },
  probabilityText: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '11px',
    fontWeight: 600,
    color: '#fff',
    zIndex: 1,
  },
  differentialConfidence: {
    marginBottom: '8px',
  },
  confidenceBadge: {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: 600,
    color: 'white',
  },
  differentialReasoning: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '12px',
    lineHeight: 1.5,
  },
  supportingSymptoms: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '8px',
  },
  requiredTests: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  recommendationsSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  recommendationsCard: {
    padding: '20px',
    background: 'rgba(16,185,129,0.1)',
    borderRadius: '16px',
    border: '1px solid rgba(16,185,129,0.2)',
  },
  selfCareCard: {
    padding: '20px',
    background: 'rgba(59,130,246,0.1)',
    borderRadius: '16px',
    border: '1px solid rgba(59,130,246,0.2)',
  },
  recommendationsList: {
    marginTop: '12px',
    paddingLeft: '20px',
    li: {
      marginBottom: '8px',
      fontSize: '13px',
      color: 'var(--text-secondary)',
    },
  },
  consultBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
    marginTop: '20px',
  },
  riskSection: {
    maxHeight: '500px',
    overflow: 'auto' as const,
  },
  riskCard: {
    padding: '20px',
    background: 'var(--bg-secondary)',
    borderRadius: '16px',
    border: '2px solid',
  },
  riskHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
  },
  riskTitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  riskCondition: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  riskScore: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 700,
    color: 'white',
  },
  riskLevel: {
    marginBottom: '16px',
    fontSize: '14px',
  },
  riskFactors: {
    marginBottom: '16px',
    ul: {
      marginTop: '8px',
      paddingLeft: '20px',
      li: {
        fontSize: '13px',
        color: 'var(--text-secondary)',
        marginBottom: '4px',
      },
    },
  },
  riskRecommendations: {
    marginBottom: '16px',
    ul: {
      marginTop: '8px',
      paddingLeft: '20px',
      li: {
        fontSize: '13px',
        color: 'var(--text-secondary)',
        marginBottom: '4px',
      },
    },
  },
  riskNextSteps: {
    padding: '12px',
    background: 'rgba(59,130,246,0.1)',
    borderRadius: '8px',
    fontSize: '13px',
  },
};

export default EnhancedSymptomChecker;