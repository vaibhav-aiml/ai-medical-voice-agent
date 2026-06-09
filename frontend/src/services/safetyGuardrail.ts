// Crisis keywords and patterns
export const CRISIS_PATTERNS = {
  suicidal: [
    'kill myself', 'end my life', 'suicide', 'want to die', 'die already',
    'no reason to live', 'better off dead', 'end it all', 'take my life'
  ],
  selfHarm: [
    'hurt myself', 'cut myself', 'self harm', 'injury to myself',
    'burn myself', 'self destructive'
  ],
  mentalHealth: [
    'severe depression', 'panic attack', 'schizophrenia', 'hallucination',
    'psychosis', 'manic episode', 'severe anxiety'
  ],
  emergency: [
    'chest pain', 'difficulty breathing', 'heart attack', 'stroke',
    'seizure', 'unconscious', 'bleeding heavily', 'choking'
  ]
};

export interface CrisisResource {
  type: 'suicidal' | 'selfHarm' | 'mentalHealth' | 'emergency';
  message: string;
  hotline: string;
  instruction: string;
}

export const CRISIS_RESOURCES: Record<string, CrisisResource> = {
  suicidal: {
    type: 'suicidal',
    message: 'We care about your safety. You are not alone.',
    hotline: '988 (Suicide & Crisis Lifeline)',
    instruction: 'Please call 988 immediately for confidential support, available 24/7.'
  },
  selfHarm: {
    type: 'selfHarm',
    message: 'Your safety is our priority. Help is available right now.',
    hotline: '988 (Crisis Lifeline)',
    instruction: 'Please reach out to 988 for immediate support. You deserve help.'
  },
  mentalHealth: {
    type: 'mentalHealth',
    message: 'Mental health emergencies require immediate professional attention.',
    hotline: '988 (Crisis Lifeline)',
    instruction: 'Contact 988 for mental health crisis support. They are trained to help you.'
  },
  emergency: {
    type: 'emergency',
    message: '⚠️ MEDICAL EMERGENCY DETECTED ⚠️',
    hotline: '911 (Emergency Services)',
    instruction: 'This appears to be a medical emergency. Please call 911 or go to the nearest emergency room immediately.'
  }
};

export class SafetyGuardrail {
  private crisisDetected: boolean = false;
  private detectedType: string | null = null;

  analyzeMessage(message: string): {
    isSafe: boolean;
    crisisDetected: boolean;
    crisisType?: string;
    resource?: CrisisResource;
    sanitizedMessage?: string;
  } {
    const lowerMessage = message.toLowerCase();
    
    // Check for crisis patterns
    for (const [type, patterns] of Object.entries(CRISIS_PATTERNS)) {
      for (const pattern of patterns) {
        if (lowerMessage.includes(pattern)) {
          this.crisisDetected = true;
          this.detectedType = type;
          
          return {
            isSafe: false,
            crisisDetected: true,
            crisisType: type,
            resource: CRISIS_RESOURCES[type],
            sanitizedMessage: this.redactCrisisContent(message)
          };
        }
      }
    }
    
    return {
      isSafe: true,
      crisisDetected: false
    };
  }

  private redactCrisisContent(message: string): string {
    // Redact sensitive crisis content while keeping the message for context
    return message.replace(/\b(?:kill|suicide|die|hurt\s*myself|cut\s*myself)\b/gi, '[REDACTED]');
  }

  getCrisisResponse(): string {
    if (!this.crisisDetected || !this.detectedType) {
      return '';
    }
    
    const resource = CRISIS_RESOURCES[this.detectedType];
    return `${resource.message}\n\n📞 ${resource.hotline}\n\n${resource.instruction}\n\nThis AI consultation will now end. Please seek immediate professional help.`;
  }
}

export const safetyGuardrail = new SafetyGuardrail();