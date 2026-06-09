// Triage & Urgency Scoring Service

export type UrgencyLevel = 'routine' | 'consult_48h' | 'consult_24h' | 'emergency_immediate';

export interface TriageResult {
  urgencyLevel: UrgencyLevel;
  score: number; // 0-100, higher = more urgent
  recommendation: string;
  riskFactors: string[];
  suggestedAction: string;
  requiresAmbulance: boolean;
  colorCode: 'green' | 'yellow' | 'orange' | 'red';
}

// Critical keywords that indicate emergency
const EMERGENCY_KEYWORDS = {
  cardiac: ['chest pain', 'heart attack', 'palpitations', 'racing heart', 'tightness in chest'],
  respiratory: ['difficulty breathing', 'can\'t breathe', 'shortness of breath', 'choking', 'gasping'],
  neurological: ['stroke', 'seizure', 'unconscious', 'fainted', 'passed out', 'cannot speak', 'paralysis'],
  severe_pain: ['severe pain', 'excruciating pain', 'worst pain ever', 'screaming in pain'],
  bleeding: ['severe bleeding', 'uncontrollable bleeding', 'blood loss', 'hemorrhage'],
  head_injury: ['head injury', 'concussion', 'hit head', 'lost consciousness after fall'],
  allergic: ['anaphylaxis', 'severe allergic reaction', 'throat swelling', 'cannot swallow'],
  mental: ['suicidal', 'kill myself', 'want to die', 'end my life', 'self harm']
};

// Keywords for 24-hour consultation
const URGENT_24H_KEYWORDS = {
  fever: ['high fever', 'fever over 103', 'persistent fever', 'fever for 3 days'],
  infection: ['infection', 'pus', 'wound infection', 'cellulitis', 'redness spreading'],
  pain: ['moderate pain', 'pain not improving', 'worsening pain'],
  respiratory: ['persistent cough', 'productive cough', 'wheezing', 'chest congestion'],
  digestive: ['vomiting', 'diarrhea', 'dehydration', 'blood in stool', 'severe nausea']
};

// Keywords for 48-hour consultation
const ROUTINE_48H_KEYWORDS = {
  mild_symptoms: ['mild headache', 'slight fever', 'minor cough', 'cold symptoms'],
  chronic: ['follow up', 'medication refill', 'chronic condition', 'ongoing issue'],
  preventive: ['checkup', 'routine', 'screening', 'vaccination', 'annual physical']
};

export class TriageService {
  
  analyzeSymptoms(symptoms: string, age?: number, existingConditions?: string[]): TriageResult {
    const lowerSymptoms = symptoms.toLowerCase();
    let riskFactors: string[] = [];
    let maxUrgencyScore = 0;
    let urgencyLevel: UrgencyLevel = 'routine';
    
    // Check for emergency keywords (score 90-100)
    for (const [category, keywords] of Object.entries(EMERGENCY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerSymptoms.includes(keyword)) {
          riskFactors.push(`${category.replace(/_/g, ' ')}: "${keyword}"`);
          maxUrgencyScore = Math.max(maxUrgencyScore, 95);
          urgencyLevel = 'emergency_immediate';
        }
      }
    }
    
    // Check for 24-hour urgency (score 70-89)
    if (urgencyLevel !== 'emergency_immediate') {
      for (const [category, keywords] of Object.entries(URGENT_24H_KEYWORDS)) {
        for (const keyword of keywords) {
          if (lowerSymptoms.includes(keyword)) {
            riskFactors.push(`${category.replace(/_/g, ' ')}: "${keyword}"`);
            maxUrgencyScore = Math.max(maxUrgencyScore, 80);
            urgencyLevel = 'consult_24h';
          }
        }
      }
    }
    
    // Check for 48-hour routine (score 40-69)
    if (urgencyLevel === 'routine') {
      for (const [category, keywords] of Object.entries(ROUTINE_48H_KEYWORDS)) {
        for (const keyword of keywords) {
          if (lowerSymptoms.includes(keyword)) {
            riskFactors.push(`${category.replace(/_/g, ' ')}: "${keyword}"`);
            maxUrgencyScore = Math.max(maxUrgencyScore, 50);
            urgencyLevel = 'consult_48h';
          }
        }
      }
    }
    
    // Age-based risk adjustment
    if (age) {
      if (age > 65) {
        riskFactors.push('Age risk: Patient over 65 years');
        maxUrgencyScore = Math.min(100, maxUrgencyScore + 15);
        if (maxUrgencyScore >= 70 && urgencyLevel === 'routine') {
          urgencyLevel = 'consult_24h';
        }
      } else if (age < 2) {
        riskFactors.push('Age risk: Infant or toddler under 2 years');
        maxUrgencyScore = Math.min(100, maxUrgencyScore + 20);
        if (maxUrgencyScore >= 70 && urgencyLevel === 'routine') {
          urgencyLevel = 'consult_24h';
        }
      }
    }
    
    // Existing conditions adjustment
    if (existingConditions && existingConditions.length > 0) {
      const highRiskConditions = ['diabetes', 'heart disease', 'asthma', 'COPD', 'kidney disease', 'cancer'];
      for (const condition of existingConditions) {
        if (highRiskConditions.includes(condition.toLowerCase())) {
          riskFactors.push(`Pre-existing condition: ${condition}`);
          maxUrgencyScore = Math.min(100, maxUrgencyScore + 10);
        }
      }
    }
    
    // Default score if no keywords matched
    if (maxUrgencyScore === 0) {
      maxUrgencyScore = 30;
      urgencyLevel = 'routine';
      riskFactors.push('General: Mild or unspecified symptoms');
    }
    
    // Generate recommendation and color code
    const result = this.getRecommendation(urgencyLevel, maxUrgencyScore, riskFactors);
    
    return {
      urgencyLevel,
      score: maxUrgencyScore,
      recommendation: result.recommendation,
      riskFactors,
      suggestedAction: result.suggestedAction,
      requiresAmbulance: result.requiresAmbulance,
      colorCode: result.colorCode
    };
  }
  
  private getRecommendation(level: UrgencyLevel, score: number, riskFactors: string[]): any {
    switch (level) {
      case 'emergency_immediate':
        return {
          recommendation: "MEDICAL EMERGENCY DETECTED - Based on your symptoms, this requires immediate medical attention. Do not wait.",
          suggestedAction: "CALL 108 (Ambulance) or go to the nearest Emergency Room immediately. Do not drive yourself.",
          requiresAmbulance: true,
          colorCode: 'red'
        };
        
      case 'consult_24h':
        return {
          recommendation: "URGENT - See a doctor within 24 hours. Your symptoms require prompt medical attention.",
          suggestedAction: "Schedule an urgent appointment with your doctor or visit a nearby clinic within 24 hours.",
          requiresAmbulance: false,
          colorCode: 'orange'
        };
        
      case 'consult_48h':
        return {
          recommendation: "Schedule a consultation within 48 hours. While not an emergency, your symptoms should be evaluated by a healthcare professional.",
          suggestedAction: "Book a consultation with your primary care physician or use our telemedicine service within 2 days.",
          requiresAmbulance: false,
          colorCode: 'yellow'
        };
        
      default:
        return {
          recommendation: "Routine - Monitor your symptoms. Your symptoms appear mild. No immediate medical attention required.",
          suggestedAction: "Schedule a routine checkup if symptoms persist for more than 5-7 days. Rest and stay hydrated.",
          requiresAmbulance: false,
          colorCode: 'green'
        };
    }
  }
}

export const triageService = new TriageService();