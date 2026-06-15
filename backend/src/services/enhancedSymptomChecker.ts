export interface Symptom {
  id: string;
  name: string;
  category: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration?: string;
  location?: string;
  triggers?: string[];
  associatedSymptoms?: string[];
}

export interface PatientProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  medicalHistory?: string[];
  medications?: string[];
  allergies?: string[];
  lifestyle?: {
    smoking?: boolean;
    alcohol?: boolean;
    exercise?: string;
    stress?: 'low' | 'medium' | 'high';
    sleep?: number;
  };
  familyHistory?: string[];
}

export interface DifferentialDiagnosis {
  condition: string;
  probability: number;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  supportingSymptoms: string[];
  conflictingSymptoms: string[];
  requiredTests?: string[];
}

export interface ChronicRiskAssessment {
  condition: string;
  riskScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  factors: string[];
  recommendations: string[];
  screeningFrequency: string;
  nextSteps: string[];
}

export interface SymptomAnalysisResult {
  primaryDiagnosis: string;
  differentialDiagnoses: DifferentialDiagnosis[];
  urgencyLevel: 'routine' | 'consult_48h' | 'consult_24h' | 'emergency';
  recommendations: string[];
  selfCare: string[];
  whenToSeeDoctor: string;
  riskAssessment?: ChronicRiskAssessment;
  similarCases?: number;
  specialistReferral?: string;
}

// Medical knowledge base for symptom mapping
const SYMPTOM_DATABASE = {
  headache: {
    conditions: ['Tension Headache', 'Migraine', 'Cluster Headache', 'Sinusitis', 'Hypertension'],
    chronicConditions: ['Chronic Migraine', 'Tension-Type Headache'],
    riskFactors: ['stress', 'lack of sleep', 'dehydration', 'eye strain', 'caffeine withdrawal'],
    redFlags: ['sudden severe onset', 'with fever', 'after head injury', 'with neurological symptoms'],
  },
  chest_pain: {
    conditions: ['Angina', 'GERD', 'Musculoskeletal Pain', 'Anxiety', 'Pericarditis'],
    chronicConditions: ['Coronary Artery Disease', 'GERD', 'Anxiety Disorder'],
    riskFactors: ['smoking', 'high blood pressure', 'diabetes', 'high cholesterol', 'family history'],
    redFlags: ['with shortness of breath', 'radiating to arm', 'with nausea', 'with sweating'],
  },
  fever: {
    conditions: ['Viral Infection', 'Bacterial Infection', 'Influenza', 'COVID-19', 'Urinary Tract Infection'],
    chronicConditions: ['Autoimmune Disease', 'Chronic Infection'],
    riskFactors: ['recent travel', 'contact with sick individuals', 'immunocompromised'],
    redFlags: ['persistent >3 days', '>103°F', 'with stiff neck', 'with confusion'],
  },
  shortness_of_breath: {
    conditions: ['Asthma', 'COPD', 'Anxiety', 'Pneumonia', 'Heart Failure'],
    chronicConditions: ['Asthma', 'COPD', 'Heart Failure'],
    riskFactors: ['smoking', 'obesity', 'allergies', 'family history'],
    redFlags: ['at rest', 'with chest pain', 'sudden onset', 'with wheezing'],
  },
  fatigue: {
    conditions: ['Anemia', 'Thyroid Disorder', 'Sleep Apnea', 'Depression', 'Chronic Fatigue Syndrome'],
    chronicConditions: ['Anemia', 'Hypothyroidism', 'Chronic Fatigue Syndrome', 'Depression'],
    riskFactors: ['poor sleep', 'stress', 'poor nutrition', 'sedentary lifestyle'],
    redFlags: ['with weight loss', 'with fever', 'unexplained bruising', 'night sweats'],
  },
  joint_pain: {
    conditions: ['Osteoarthritis', 'Rheumatoid Arthritis', 'Gout', 'Bursitis', 'Lyme Disease'],
    chronicConditions: ['Osteoarthritis', 'Rheumatoid Arthritis', 'Gout'],
    riskFactors: ['age >50', 'obesity', 'previous injury', 'family history'],
    redFlags: ['with fever', 'with swelling', 'joint deformity', 'sudden severe pain'],
  },
  abdominal_pain: {
    conditions: ['IBS', 'Gastritis', 'Appendicitis', 'Gallstones', 'Constipation'],
    chronicConditions: ['IBS', 'GERD', 'Peptic Ulcer Disease'],
    riskFactors: ['stress', 'diet', 'alcohol', 'smoking', 'family history'],
    redFlags: ['with fever', 'with vomiting', 'blood in stool', 'severe tenderness'],
  },
  cough: {
    conditions: ['Common Cold', 'Bronchitis', 'Pneumonia', 'Allergies', 'Asthma', 'GERD'],
    chronicConditions: ['Asthma', 'COPD', 'GERD', 'Chronic Bronchitis'],
    riskFactors: ['smoking', 'allergies', 'asthma history', 'exposure to irritants'],
    redFlags: ['with blood', 'with fever >101°F', 'difficulty breathing', 'wheezing'],
  },
  dizziness: {
    conditions: ['Vertigo', 'Dehydration', 'Anemia', 'Low Blood Pressure', 'Inner Ear Disorder'],
    chronicConditions: ['Vertigo', 'Meniere\'s Disease', 'Orthostatic Hypotension'],
    riskFactors: ['dehydration', 'medications', 'heart condition', 'neurological disorder'],
    redFlags: ['with chest pain', 'with fainting', 'with numbness', 'with vision changes'],
  },
  rash: {
    conditions: ['Allergic Reaction', 'Eczema', 'Psoriasis', 'Fungal Infection', 'Contact Dermatitis'],
    chronicConditions: ['Eczema', 'Psoriasis', 'Chronic Hives'],
    riskFactors: ['allergies', 'family history', 'stress', 'environmental factors'],
    redFlags: ['with fever', 'with difficulty breathing', 'with blistering', 'widespread rapid spread'],
  },
};

class EnhancedSymptomChecker {
  
  analyzeSymptoms(
    symptoms: string[],
    durations: Record<string, string>,
    severities: Record<string, string>,
    patientProfile: PatientProfile
  ): SymptomAnalysisResult {
    const matchedConditions = new Map<string, number>();
    const supportingSymptoms: Record<string, string[]> = {};
    const redFlags: string[] = [];
    
    // Process each symptom
    for (const symptom of symptoms) {
      const symptomKey = this.normalizeSymptom(symptom);
      const symptomData = SYMPTOM_DATABASE[symptomKey as keyof typeof SYMPTOM_DATABASE];
      
      if (symptomData) {
        // Score conditions based on symptoms
        for (const condition of symptomData.conditions) {
          const currentScore = matchedConditions.get(condition) || 0;
          matchedConditions.set(condition, currentScore + 1);
          
          if (!supportingSymptoms[condition]) {
            supportingSymptoms[condition] = [];
          }
          supportingSymptoms[condition].push(symptom);
        }
        
        // Check for red flags
        for (const redFlag of symptomData.redFlags) {
          if (this.checkRedFlag(redFlag, symptom, severities[symptom], durations[symptom])) {
            redFlags.push(redFlag);
          }
        }
      }
    }
    
    // Calculate urgency based on red flags and severity
    const urgencyLevel = this.calculateUrgency(redFlags, severities, patientProfile);
    
    // Generate differential diagnoses
    const differentialDiagnoses = this.generateDifferentialDiagnoses(
      matchedConditions,
      supportingSymptoms,
      patientProfile
    );
    
    // Get primary diagnosis (highest probability)
    const primaryDiagnosis = differentialDiagnoses[0]?.condition || 'Under evaluation';
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(primaryDiagnosis, urgencyLevel, patientProfile);
    
    // Generate self-care tips
    const selfCare = this.generateSelfCare(primaryDiagnosis, symptoms);
    
    // Check for chronic condition risk
    const riskAssessment = this.assessChronicRisk(symptoms, patientProfile);
    
    // Determine if specialist referral is needed
    const specialistReferral = this.getSpecialistReferral(primaryDiagnosis);
    
    return {
      primaryDiagnosis,
      differentialDiagnoses,
      urgencyLevel,
      recommendations,
      selfCare,
      whenToSeeDoctor: this.getWhenToSeeDoctor(urgencyLevel, redFlags),
      riskAssessment,
      similarCases: Math.floor(Math.random() * 50) + 10, // Placeholder for actual data
      specialistReferral,
    };
  }
  
  private normalizeSymptom(symptom: string): string {
    const normalized = symptom.toLowerCase().trim();
    const mappings: Record<string, string> = {
      'head pain': 'headache',
      'chest tightness': 'chest_pain',
      'breathing difficulty': 'shortness_of_breath',
      'tiredness': 'fatigue',
      'exhaustion': 'fatigue',
      'joint ache': 'joint_pain',
      'stomach pain': 'abdominal_pain',
      'belly pain': 'abdominal_pain',
      'coughing': 'cough',
      'lightheadedness': 'dizziness',
      'skin rash': 'rash',
      'high temperature': 'fever',
    };
    return mappings[normalized] || normalized.replace(/ /g, '_');
  }
  
  private checkRedFlag(
    redFlag: string,
    symptom: string,
    severity: string,
    duration: string
  ): boolean {
    // Check for severe symptoms
    if (severity === 'severe') return true;
    
    // Check for prolonged duration
    if (duration && this.parseDuration(duration) > 7) return true;
    
    return false;
  }
  
  private parseDuration(duration: string): number {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
  
  private calculateUrgency(
    redFlags: string[],
    severities: Record<string, string>,
    patientProfile: PatientProfile
  ): SymptomAnalysisResult['urgencyLevel'] {
    // Emergency conditions
    if (redFlags.length >= 2) return 'emergency';
    if (Object.values(severities).includes('severe')) return 'emergency';
    
    // High risk based on age
    if (patientProfile.age > 65 && Object.values(severities).includes('moderate')) {
      return 'consult_24h';
    }
    
    // Check for chronic condition risks
    const chronicConditions = this.getChronicConditionRisks(patientProfile);
    if (chronicConditions.length > 0 && Object.values(severities).includes('moderate')) {
      return 'consult_24h';
    }
    
    // Routine check
    if (redFlags.length === 0 && !Object.values(severities).includes('moderate')) {
      return 'routine';
    }
    
    return 'consult_48h';
  }
  
  private getChronicConditionRisks(patientProfile: PatientProfile): string[] {
    const risks: string[] = [];
    
    if (patientProfile.age > 60) risks.push('age');
    if (patientProfile.lifestyle?.smoking) risks.push('smoking');
    if (patientProfile.lifestyle?.stress === 'high') risks.push('chronic stress');
    if (patientProfile.medicalHistory?.some(h => h.includes('diabetes'))) risks.push('diabetes');
    if (patientProfile.medicalHistory?.some(h => h.includes('hypertension'))) risks.push('hypertension');
    
    return risks;
  }
  
  private generateDifferentialDiagnoses(
    matchedConditions: Map<string, number>,
    supportingSymptoms: Record<string, string[]>,
    patientProfile: PatientProfile
  ): DifferentialDiagnosis[] {
    const diagnoses: DifferentialDiagnosis[] = [];
    
    for (const [condition, score] of Array.from(matchedConditions.entries())) {
      // Calculate probability based on symptom match and patient factors
      let probability = Math.min(95, score * 20 + this.getPatientFactorBonus(condition, patientProfile));
      
      // Determine confidence level
      let confidence: 'high' | 'medium' | 'low' = 'medium';
      if (probability > 70) confidence = 'high';
      else if (probability < 40) confidence = 'low';
      
      // Generate reasoning
      const reasoning = this.generateReasoning(condition, supportingSymptoms[condition]);
      
      diagnoses.push({
        condition,
        probability,
        confidence,
        reasoning,
        supportingSymptoms: supportingSymptoms[condition] || [],
        conflictingSymptoms: [],
        requiredTests: this.getRequiredTests(condition),
      });
    }
    
    // Sort by probability (highest first) and take top 5
    return diagnoses.sort((a, b) => b.probability - a.probability).slice(0, 5);
  }
  
  private getPatientFactorBonus(condition: string, patientProfile: PatientProfile): number {
    let bonus = 0;
    
    if (condition === 'Coronary Artery Disease' && patientProfile.age > 50) bonus += 15;
    if (condition === 'Osteoarthritis' && patientProfile.age > 60) bonus += 20;
    if (condition === 'Asthma' && patientProfile.medicalHistory?.includes('asthma')) bonus += 30;
    if (condition === 'Diabetes' && patientProfile.familyHistory?.includes('diabetes')) bonus += 20;
    
    return bonus;
  }
  
  private generateReasoning(condition: string, symptoms: string[]): string {
    const symptomList = symptoms.join(', ');
    return `The combination of ${symptomList} is commonly associated with ${condition}. This pattern matches typical clinical presentations.`;
  }
  
  private getRequiredTests(condition: string): string[] {
    const tests: Record<string, string[]> = {
      'Coronary Artery Disease': ['ECG', 'Stress Test', 'Lipid Profile'],
      'Diabetes': ['Blood Glucose', 'HbA1c', 'Fasting Glucose'],
      'Anemia': ['Complete Blood Count', 'Iron Studies', 'Vitamin B12'],
      'Thyroid Disorder': ['TSH', 'T3', 'T4'],
      'Rheumatoid Arthritis': ['RF', 'Anti-CCP', 'ESR', 'CRP'],
    };
    return tests[condition] || ['Clinical Examination', 'Basic Blood Work'];
  }
  
  private generateRecommendations(
    diagnosis: string,
    urgency: string,
    patientProfile: PatientProfile
  ): string[] {
    const recommendations: string[] = [];
    
    if (urgency === 'emergency') {
      recommendations.push('Seek immediate medical attention at the nearest emergency room');
      recommendations.push('Call 108 for ambulance if experiencing severe symptoms');
    } else if (urgency === 'consult_24h') {
      recommendations.push('Schedule an urgent appointment with your primary care physician within 24 hours');
      recommendations.push('Monitor symptoms closely and go to ER if they worsen');
    } else if (urgency === 'consult_48h') {
      recommendations.push('Book an appointment with your doctor within 48 hours');
      recommendations.push('Keep a symptom diary to share with your doctor');
    } else {
      recommendations.push('Monitor symptoms and practice self-care at home');
      recommendations.push('Schedule a routine checkup if symptoms persist beyond 7 days');
    }
    
    // Add diagnosis-specific recommendations
    if (diagnosis.includes('Migraine')) {
      recommendations.push('Rest in a dark, quiet room');
      recommendations.push('Apply cold compress to forehead');
      recommendations.push('Stay hydrated');
    }
    
    if (diagnosis.includes('Hypertension')) {
      recommendations.push('Monitor blood pressure twice daily');
      recommendations.push('Reduce sodium intake');
      recommendations.push('Exercise 30 minutes daily');
    }
    
    return recommendations;
  }
  
  private generateSelfCare(diagnosis: string, symptoms: string[]): string[] {
    const selfCare: string[] = [
      'Get adequate rest (7-8 hours of sleep)',
      'Stay hydrated with 8-10 glasses of water daily',
      'Maintain a balanced diet rich in fruits and vegetables',
      'Avoid alcohol and tobacco',
    ];
    
    if (symptoms.includes('fever')) {
      selfCare.push('Monitor temperature every 4-6 hours');
      selfCare.push('Use fever reducers as needed');
    }
    
    if (symptoms.includes('headache')) {
      selfCare.push('Apply warm or cold compress to forehead');
      selfCare.push('Practice relaxation techniques');
    }
    
    if (symptoms.includes('cough')) {
      selfCare.push('Use honey and warm water for soothing');
      selfCare.push('Use a humidifier');
    }
    
    return selfCare;
  }
  
  private getWhenToSeeDoctor(urgency: string, redFlags: string[]): string {
    if (urgency === 'emergency') {
      return '⚠️ SEEK IMMEDIATE MEDICAL ATTENTION - Go to the ER or call 108 now';
    }
    if (urgency === 'consult_24h') {
      return 'See a doctor within 24 hours - Your symptoms require prompt evaluation';
    }
    if (urgency === 'consult_48h') {
      return 'Schedule an appointment within 48 hours - Professional medical evaluation recommended';
    }
    return 'Monitor symptoms at home. See a doctor if symptoms persist beyond 7 days or worsen.';
  }
  
  private assessChronicRisk(
    symptoms: string[],
    patientProfile: PatientProfile
  ): ChronicRiskAssessment | undefined {
    const riskFactors: string[] = [];
    let riskScore = 0;
    
    // Age factor
    if (patientProfile.age > 50) {
      riskFactors.push('Age > 50 years');
      riskScore += 20;
    } else if (patientProfile.age > 40) {
      riskFactors.push('Age > 40 years');
      riskScore += 10;
    }
    
    // Lifestyle factors
    if (patientProfile.lifestyle?.smoking) {
      riskFactors.push('Smoking history');
      riskScore += 25;
    }
    if (patientProfile.lifestyle?.alcohol) {
      riskFactors.push('Alcohol consumption');
      riskScore += 10;
    }
    if (patientProfile.lifestyle?.stress === 'high') {
      riskFactors.push('High stress levels');
      riskScore += 15;
    }
    if (patientProfile.lifestyle?.sleep && patientProfile.lifestyle.sleep < 6) {
      riskFactors.push('Poor sleep (<6 hours)');
      riskScore += 10;
    }
    
    // Medical history
    if (patientProfile.medicalHistory) {
      if (patientProfile.medicalHistory.includes('diabetes')) {
        riskFactors.push('Diabetes history');
        riskScore += 25;
      }
      if (patientProfile.medicalHistory.includes('hypertension')) {
        riskFactors.push('Hypertension history');
        riskScore += 20;
      }
      if (patientProfile.medicalHistory.includes('heart disease')) {
        riskFactors.push('Heart disease history');
        riskScore += 30;
      }
    }
    
    // Family history
    if (patientProfile.familyHistory) {
      if (patientProfile.familyHistory.includes('diabetes')) {
        riskFactors.push('Family history of diabetes');
        riskScore += 15;
      }
      if (patientProfile.familyHistory.includes('heart disease')) {
        riskFactors.push('Family history of heart disease');
        riskScore += 20;
      }
    }
    
    // Determine risk level
    let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low';
    if (riskScore >= 70) riskLevel = 'critical';
    else if (riskScore >= 50) riskLevel = 'high';
    else if (riskScore >= 25) riskLevel = 'moderate';
    
    if (riskScore > 0) {
      return {
        condition: this.identifyChronicCondition(symptoms, patientProfile),
        riskScore,
        riskLevel,
        factors: riskFactors,
        recommendations: this.getChronicRecommendations(riskLevel, riskFactors),
        screeningFrequency: this.getScreeningFrequency(riskLevel),
        nextSteps: this.getNextSteps(riskLevel),
      };
    }
    
    return undefined;
  }
  
  private identifyChronicCondition(symptoms: string[], patientProfile: PatientProfile): string {
    if (symptoms.includes('chest_pain') || patientProfile.medicalHistory?.includes('hypertension')) {
      return 'Cardiovascular Disease';
    }
    if (symptoms.includes('fatigue') || patientProfile.familyHistory?.includes('diabetes')) {
      return 'Metabolic Syndrome / Diabetes Risk';
    }
    if (symptoms.includes('joint_pain') && patientProfile.age > 50) {
      return 'Osteoarthritis / Joint Degeneration';
    }
    return 'Chronic Disease Risk';
  }
  
  private getChronicRecommendations(riskLevel: string, riskFactors: string[]): string[] {
    const recommendations: string[] = [
      'Schedule an annual physical examination',
      'Maintain a healthy weight through diet and exercise',
    ];
    
    if (riskFactors.some(f => f.includes('smoking'))) {
      recommendations.push('Consider smoking cessation program');
    }
    if (riskFactors.some(f => f.includes('diabetes'))) {
      recommendations.push('Monitor blood sugar levels regularly');
    }
    if (riskLevel === 'high' || riskLevel === 'critical') {
      recommendations.push('Consult with a specialist for comprehensive risk assessment');
      recommendations.push('Consider genetic testing for predispositions');
    }
    
    return recommendations;
  }
  
  private getScreeningFrequency(riskLevel: string): string {
    switch (riskLevel) {
      case 'critical': return 'Every 3 months';
      case 'high': return 'Every 6 months';
      case 'moderate': return 'Annually';
      default: return 'Every 2-3 years';
    }
  }
  
  private getNextSteps(riskLevel: string): string[] {
    const steps: string[] = [];
    
    if (riskLevel === 'critical' || riskLevel === 'high') {
      steps.push('Schedule immediate consultation with a specialist');
      steps.push('Complete comprehensive diagnostic testing');
      steps.push('Develop personalized prevention plan');
    } else {
      steps.push('Continue healthy lifestyle habits');
      steps.push('Monitor symptoms and maintain regular checkups');
    }
    
    return steps;
  }
  
  private getSpecialistReferral(diagnosis: string): string | undefined {
    const referrals: Record<string, string> = {
      'Coronary Artery Disease': 'Cardiologist',
      'Hypertension': 'Cardiologist',
      'Diabetes': 'Endocrinologist',
      'Rheumatoid Arthritis': 'Rheumatologist',
      'Asthma': 'Pulmonologist',
      'Migraine': 'Neurologist',
      'COPD': 'Pulmonologist',
      'Heart Failure': 'Cardiologist',
    };
    
    return referrals[diagnosis];
  }
}

export const enhancedSymptomChecker = new EnhancedSymptomChecker();