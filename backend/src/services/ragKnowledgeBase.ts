// RAG (Retrieval-Augmented Generation) Medical Knowledge Base

export interface MedicalKnowledge {
  id: string;
  condition: string;
  symptoms: string[];
  commonTreatments: string[];
  warningSigns: string[];
  selfCare: string[];
  whenToSeeDoctor: string;
  source: string;
  confidence: number;
}

// Medical knowledge base (in production, this would be a vector database)
const MEDICAL_KNOWLEDGE_BASE: MedicalKnowledge[] = [
  {
    id: '1',
    condition: 'Common Cold / Viral Upper Respiratory Infection',
    symptoms: ['runny nose', 'sneezing', 'mild sore throat', 'cough', 'low grade fever', 'congestion'],
    commonTreatments: ['rest', 'hydration', 'over-the-counter cold medications', 'honey for cough'],
    warningSigns: ['high fever over 103°F (39.4°C)', 'difficulty breathing', 'symptoms lasting >10 days'],
    selfCare: [
      'Get plenty of rest',
      'Drink warm fluids like tea with honey',
      'Use saline nasal spray for congestion',
      'Gargle with warm salt water for sore throat'
    ],
    whenToSeeDoctor: 'If fever exceeds 103°F, symptoms worsen after 5 days, or you have difficulty breathing',
    source: 'CDC - Common Cold Guidelines',
    confidence: 0.95
  },
  {
    id: '2',
    condition: 'Headache (Tension Type)',
    symptoms: ['mild to moderate headache', 'pressure around forehead', 'tightness in neck', 'no nausea'],
    commonTreatments: ['rest', 'hydration', 'over-the-counter pain relievers', 'stress management'],
    warningSigns: ['sudden severe headache (thunderclap)', 'headache with fever', 'headache after head injury'],
    selfCare: [
      'Apply cold or warm compress to forehead',
      'Practice deep breathing exercises',
      'Take a break from screens',
      'Stay hydrated'
    ],
    whenToSeeDoctor: 'If headaches are frequent (more than 15 days/month), severe, or accompanied by neurological symptoms',
    source: 'Mayo Clinic - Tension Headache',
    confidence: 0.92
  },
  {
    id: '3',
    condition: 'Migraine',
    symptoms: ['severe throbbing headache', 'nausea', 'sensitivity to light', 'sensitivity to sound', 'aura before headache'],
    commonTreatments: ['dark quiet room', 'prescription migraine medications', 'cold compress', 'caffeine (in some cases)'],
    warningSigns: ['sudden severe headache', 'headache with fever', 'neurological symptoms like weakness'],
    selfCare: [
      'Lie down in a dark, quiet room',
      'Apply cold compress to head',
      'Stay hydrated',
      'Track triggers (foods, stress, sleep)'
    ],
    whenToSeeDoctor: 'If migraines are frequent, severe, or interfering with daily life',
    source: 'American Migraine Foundation',
    confidence: 0.94
  },
  {
    id: '4',
    condition: 'Fever in Adults',
    symptoms: ['temperature >100.4°F (38°C)', 'chills', 'body aches', 'sweating', 'weakness'],
    commonTreatments: ['rest', 'hydration', 'acetaminophen or ibuprofen', 'cool compress'],
    warningSigns: ['fever >103°F (39.4°C)', 'fever lasting >3 days', 'stiff neck', 'confusion', 'severe headache'],
    selfCare: [
      'Drink plenty of fluids (water, electrolyte solutions)',
      'Use lightweight clothing and blankets',
      'Take fever-reducing medication as directed',
      'Monitor temperature every 4-6 hours'
    ],
    whenToSeeDoctor: 'If fever exceeds 103°F, lasts more than 3 days, or is accompanied by severe symptoms',
    source: 'CDC - Fever Guidelines',
    confidence: 0.96
  },
  {
    id: '5',
    condition: 'Chest Pain (Non-Cardiac)',
    symptoms: ['sharp chest pain', 'pain worsens with breathing', 'muscle strain feeling', 'pain reproducible with pressure'],
    commonTreatments: ['rest', 'anti-inflammatory medications', 'gentle stretching', 'heat application'],
    warningSigns: ['pain radiating to arm/jaw', 'shortness of breath', 'nausea', 'cold sweat', 'dizziness'],
    selfCare: [
      'Rest and avoid strenuous activity',
      'Apply heat to sore muscles',
      'Take over-the-counter anti-inflammatories if appropriate'
    ],
    whenToSeeDoctor: 'Seek emergency care immediately for suspected cardiac chest pain. For non-cardiac pain, see doctor if persistent.',
    source: 'American Heart Association',
    confidence: 0.88
  },
  {
    id: '6',
    condition: 'Hypertension (High Blood Pressure)',
    symptoms: ['often asymptomatic', 'headaches', 'shortness of breath', 'nosebleeds', 'dizziness'],
    commonTreatments: ['lifestyle changes', 'medication as prescribed', 'low sodium diet', 'regular exercise'],
    warningSigns: ['very high readings (>180/120)', 'chest pain', 'vision changes', 'difficulty speaking'],
    selfCare: [
      'Monitor blood pressure regularly',
      'Reduce sodium intake',
      'Maintain healthy weight',
      'Limit alcohol and caffeine',
      'Exercise regularly (30 min/day)'
    ],
    whenToSeeDoctor: 'If blood pressure readings are consistently elevated (>130/80) or you have a hypertensive crisis',
    source: 'American College of Cardiology',
    confidence: 0.93
  },
  {
    id: '7',
    condition: 'Diabetes (Type 2)',
    symptoms: ['increased thirst', 'frequent urination', 'increased hunger', 'fatigue', 'blurred vision', 'slow healing wounds'],
    commonTreatments: ['diet changes', 'exercise', 'oral medications', 'insulin if needed'],
    warningSigns: ['extreme thirst', 'fruity breath odor', 'rapid breathing', 'confusion', 'loss of consciousness'],
    selfCare: [
      'Monitor blood sugar regularly',
      'Follow a balanced diet low in refined sugars',
      'Stay physically active',
      'Take medications as prescribed'
    ],
    whenToSeeDoctor: 'For routine management or immediately for signs of diabetic ketoacidosis',
    source: 'American Diabetes Association',
    confidence: 0.94
  },
  {
    id: '8',
    condition: 'Anxiety / Panic Attack',
    symptoms: ['racing heart', 'shortness of breath', 'trembling', 'sweating', 'fear of losing control', 'nausea'],
    commonTreatments: ['deep breathing', 'grounding techniques', 'therapy (CBT)', 'medication if needed'],
    warningSigns: ['suicidal thoughts', 'self-harm', 'inability to function', 'panic attacks multiple times daily'],
    selfCare: [
      'Practice deep breathing (4-7-8 technique)',
      'Use the 5-4-3-2-1 grounding method',
      'Limit caffeine and alcohol',
      'Establish a regular sleep schedule',
      'Exercise regularly'
    ],
    whenToSeeDoctor: 'If anxiety interferes with daily life, work, or relationships, or if you have thoughts of self-harm',
    source: 'National Institute of Mental Health',
    confidence: 0.91
  },
  {
    id: '9',
    condition: 'Gastroesophageal Reflux Disease (GERD)',
    symptoms: ['heartburn', 'regurgitation', 'chest pain after eating', 'difficulty swallowing', 'chronic cough'],
    commonTreatments: ['antacids', 'lifestyle changes', 'PPI medications', 'avoid trigger foods'],
    warningSigns: ['difficulty swallowing', 'unexplained weight loss', 'blood in stool', 'chest pain with exertion'],
    selfCare: [
      'Eat smaller, more frequent meals',
      'Avoid lying down for 3 hours after eating',
      'Elevate head of bed',
      'Avoid trigger foods (spicy, fatty, acidic)',
      'Maintain healthy weight'
    ],
    whenToSeeDoctor: 'If symptoms persist despite lifestyle changes, or if you have warning signs',
    source: 'American College of Gastroenterology',
    confidence: 0.92
  },
  {
    id: '10',
    condition: 'Back Pain (Mechanical)',
    symptoms: ['dull ache in lower back', 'pain worsens with movement', 'stiffness', 'muscle spasms'],
    commonTreatments: ['rest', 'gentle stretching', 'over-the-counter pain relievers', 'heat/ice therapy'],
    warningSigns: ['loss of bladder/bowel control', 'numbness in groin', 'progressive weakness', 'pain after trauma'],
    selfCare: [
      'Apply ice first 48 hours, then heat',
      'Gentle walking and stretching',
      'Maintain good posture',
      'Sleep with pillow between knees (side sleeping)'
    ],
    whenToSeeDoctor: 'If pain persists >2 weeks, is severe, or accompanied by red flags',
    source: 'American Academy of Orthopedic Surgeons',
    confidence: 0.93
  }
];

export class RAGKnowledgeBase {
  
  // Search for relevant medical knowledge based on symptoms
  searchKnowledge(symptoms: string, limit: number = 3): MedicalKnowledge[] {
    const lowerSymptoms = symptoms.toLowerCase();
    const scoredResults: { knowledge: MedicalKnowledge; score: number }[] = [];
    
    for (const knowledge of MEDICAL_KNOWLEDGE_BASE) {
      let score = 0;
      
      // Score based on symptom matching
      for (const symptom of knowledge.symptoms) {
        if (lowerSymptoms.includes(symptom.toLowerCase())) {
          score += 10;
        }
      }
      
      // Score based on condition name matching
      if (lowerSymptoms.includes(knowledge.condition.toLowerCase())) {
        score += 20;
      }
      
      // Score based on warning signs matching
      for (const warning of knowledge.warningSigns) {
        if (lowerSymptoms.includes(warning.toLowerCase())) {
          score += 15;
        }
      }
      
      if (score > 0) {
        scoredResults.push({ knowledge, score });
      }
    }
    
    // Sort by score (highest first) and return top results
    scoredResults.sort((a, b) => b.score - a.score);
    return scoredResults.slice(0, limit).map(r => r.knowledge);
  }
  
  // Get condition-specific advice
  getConditionAdvice(condition: string): MedicalKnowledge | undefined {
    return MEDICAL_KNOWLEDGE_BASE.find(
      k => k.condition.toLowerCase().includes(condition.toLowerCase())
    );
  }
  
  // Generate an enhanced response using RAG
  generateEnhancedResponse(symptoms: string, userMessage: string): string {
    const relevantKnowledge = this.searchKnowledge(symptoms, 2);
    
    if (relevantKnowledge.length === 0) {
      return "I understand your concern. Based on the symptoms you've described, I recommend monitoring your condition. If symptoms worsen or persist, please consult a healthcare provider.";
    }
    
    let response = "Based on medical literature, here's what I can share:\n\n";
    
    for (const knowledge of relevantKnowledge) {
      response += `📚 **${knowledge.condition}**\n`;
      response += `• Common symptoms: ${knowledge.symptoms.slice(0, 3).join(', ')}${knowledge.symptoms.length > 3 ? '...' : ''}\n`;
      response += `• Self-care: ${knowledge.selfCare[0]}\n`;
      response += `• ⚠️ When to see a doctor: ${knowledge.whenToSeeDoctor}\n\n`;
    }
    
    response += "💡 **Important**: This information is for educational purposes and not a substitute for professional medical advice. Please consult a healthcare provider for proper diagnosis and treatment.";
    
    return response;
  }
  
  // Get emergency guidance
  getEmergencyGuidance(): string {
    return `⚠️ **EMERGENCY GUIDANCE** ⚠️

If you or someone you know is experiencing a medical emergency:
• Call 108 (Ambulance Services in India)
• Call 112 (National Emergency Number)
• Go to the nearest Emergency Room immediately

Signs of medical emergency include:
• Difficulty breathing or shortness of breath
• Chest pain or pressure
• Sudden severe headache
• Loss of consciousness
• Severe bleeding
• Seizures
• Sudden weakness or numbness on one side
• Suicidal thoughts or self-harm intentions

Do not wait. Seek immediate medical attention.`;
  }
}

export const ragKnowledgeBase = new RAGKnowledgeBase();