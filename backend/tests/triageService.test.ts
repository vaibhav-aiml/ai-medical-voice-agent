import { describe, it, expect } from 'vitest';
import { analyzeSymptoms } from '../src/services/triageService';

describe('Triage Service Tests', () => {
  // --- Existing tests preserved ---
  it('should triage emergency cardiac chest pain symptoms', () => {
    const result = analyzeSymptoms('I have sudden chest pain and shortness of breath');
    expect(result.urgencyLevel).toBe('emergency_immediate');
    expect(result.requiresAmbulance).toBe(true);
    expect(result.colorCode).toBe('red');
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  it('should triage high fever and severe infection symptoms as urgent 24h', () => {
    const result = analyzeSymptoms('My child has high fever over 103 for 3 days and vomiting');
    expect(result.urgencyLevel).toBe('consult_24h');
    expect(result.requiresAmbulance).toBe(false);
    expect(result.colorCode).toBe('orange');
  });

  it('should triage mild headache as consult 48h', () => {
    const result = analyzeSymptoms('I have a mild headache and minor cough');
    expect(result.urgencyLevel).toBe('consult_48h');
    expect(result.colorCode).toBe('yellow');
  });

  it('should triage generic mild symptoms as routine', () => {
    const result = analyzeSymptoms('I feel slightly tired today');
    expect(result.urgencyLevel).toBe('routine');
    expect(result.colorCode).toBe('green');
  });
  
  it('should adjust triage score based on patient age (elderly)', () => {
    const result = analyzeSymptoms('I feel slightly tired today', 70); // age 70
    expect(result.urgencyLevel).toBe('consult_48h'); // elevated to 48h (score 45) from routine due to age risk
    expect(result.score).toBe(45);
    expect(result.riskFactors).toContain('Age risk: Patient over 65 years');
  });

  // --- New boundary-value tests ---
  describe('Score threshold boundary tests', () => {
    it('score below 40 should remain routine (no upgrade)', () => {
      // Base score 30 (unmatched symptoms) — no age/condition modifiers
      const result = analyzeSymptoms('I feel a bit off today');
      expect(result.score).toBe(30);
      expect(result.urgencyLevel).toBe('routine');
      expect(result.colorCode).toBe('green');
    });

    it('score at exactly 40 should upgrade from routine to consult_48h', () => {
      // Base 30 + pre-existing condition (+10) = 40
      const result = analyzeSymptoms('I feel a bit off today', undefined, ['diabetes']);
      expect(result.score).toBe(40);
      expect(result.urgencyLevel).toBe('consult_48h');
      expect(result.colorCode).toBe('yellow');
    });

    it('score at exactly 45 (routine base + elderly age) should be consult_48h', () => {
      // Base 30 + age>65 (+15) = 45
      const result = analyzeSymptoms('I feel a bit off today', 70);
      expect(result.score).toBe(45);
      expect(result.urgencyLevel).toBe('consult_48h');
      expect(result.colorCode).toBe('yellow');
    });

    it('score at 70 from routine base + modifiers should upgrade to consult_24h', () => {
      // The >= 70 upgrade only applies when urgencyLevel is still 'routine' (no keyword match).
      // Base 30 (no keywords matched) + age>65 (+15) + two conditions (+20) = 65 → still < 70
      // Base 30 + age>65 (+15) + three conditions (+30) = 75 → >= 70 → upgrade to consult_24h
      const result = analyzeSymptoms('I feel a bit off today', 70, ['diabetes', 'heart disease', 'asthma']);
      expect(result.score).toBe(75); // 30 + 15 + 10 + 10 + 10
      expect(result.urgencyLevel).toBe('consult_24h');
      expect(result.colorCode).toBe('orange');
    });

    it('emergency keywords should always score >= 90', () => {
      const result = analyzeSymptoms('severe chest pain');
      expect(result.score).toBeGreaterThanOrEqual(90);
      expect(result.urgencyLevel).toBe('emergency_immediate');
      expect(result.requiresAmbulance).toBe(true);
      expect(result.colorCode).toBe('red');
    });
  });

  describe('Age-based risk escalation', () => {
    it('infant under 2 with mild symptoms should escalate score by +20', () => {
      const result = analyzeSymptoms('I feel a bit off', 1);
      expect(result.score).toBe(50); // 30 + 20
      expect(result.riskFactors).toContain('Age risk: Infant or toddler under 2 years');
      expect(result.urgencyLevel).toBe('consult_48h');
    });

    it('infant under 2 with routine symptoms should escalate score and level', () => {
      // base 30 (routine, no keywords) + 20 (infant) = 50
      // >= 40 and urgencyLevel === 'routine' → upgrades to consult_48h
      // Note: the age block checks >= 70 first, but 50 < 70 so it stays routine there.
      // Then the final block at lines 136-139 upgrades it to consult_48h (>= 40).
      const result = analyzeSymptoms('slight fever and minor cough', 1);
      // 'slight fever' and 'minor cough' match ROUTINE_48H_KEYWORDS → urgencyLevel = consult_48h, score = 50
      // infant age adds +20 → score = 70, but urgencyLevel is already 'consult_48h' (not 'routine')
      // so the age block's >= 70 check (which only upgrades from 'routine') doesn't fire
      expect(result.score).toBe(70);
      expect(result.urgencyLevel).toBe('consult_48h'); // stays consult_48h because keyword already set it
    });

    it('exact age boundary: age 65 should NOT trigger elderly risk', () => {
      const result = analyzeSymptoms('I feel a bit off today', 65);
      // Age check is > 65, not >= 65
      expect(result.score).toBe(30);
      expect(result.riskFactors).not.toContain('Age risk: Patient over 65 years');
    });

    it('exact age boundary: age 2 should NOT trigger infant risk', () => {
      const result = analyzeSymptoms('I feel a bit off today', 2);
      // Age check is < 2, not <= 2
      expect(result.score).toBe(30);
      expect(result.riskFactors).not.toContain('Age risk: Infant or toddler under 2 years');
    });
  });

  describe('Pre-existing conditions', () => {
    it('should increase score by 10 for each matching high-risk condition', () => {
      const result = analyzeSymptoms('I feel a bit off today', undefined, ['diabetes', 'heart disease']);
      expect(result.score).toBe(50); // 30 + 10 + 10
      expect(result.riskFactors).toContain('Pre-existing condition: diabetes');
      expect(result.riskFactors).toContain('Pre-existing condition: heart disease');
    });

    it('should cap score at 100 even with many risk factors', () => {
      const result = analyzeSymptoms('chest pain and difficulty breathing', 80, 
        ['diabetes', 'heart disease', 'asthma', 'COPD', 'kidney disease', 'cancer']);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should not match non-high-risk conditions', () => {
      const result = analyzeSymptoms('I feel a bit off today', undefined, ['mild allergies', 'eczema']);
      expect(result.score).toBe(30); // No increase — those aren't in the high-risk list
    });
  });

  describe('Emergency keyword categories', () => {
    it('should detect neurological emergency keywords', () => {
      const result = analyzeSymptoms('patient had a seizure and is unconscious');
      expect(result.urgencyLevel).toBe('emergency_immediate');
      expect(result.requiresAmbulance).toBe(true);
      expect(result.riskFactors.some(f => f.includes('neurological'))).toBe(true);
    });

    it('should detect mental health emergency keywords', () => {
      const result = analyzeSymptoms('I want to kill myself');
      expect(result.urgencyLevel).toBe('emergency_immediate');
      expect(result.requiresAmbulance).toBe(true);
      expect(result.riskFactors.some(f => f.includes('mental'))).toBe(true);
    });

    it('should detect allergic emergency keywords', () => {
      const result = analyzeSymptoms('severe allergic reaction with throat swelling');
      expect(result.urgencyLevel).toBe('emergency_immediate');
      expect(result.requiresAmbulance).toBe(true);
    });

    it('should detect multiple emergency categories simultaneously', () => {
      const result = analyzeSymptoms('chest pain and difficulty breathing and severe bleeding');
      expect(result.urgencyLevel).toBe('emergency_immediate');
      // Should have risk factors from multiple categories
      expect(result.riskFactors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Urgent 24h category keywords', () => {
    it('should detect infection keywords', () => {
      const result = analyzeSymptoms('I have a wound infection with pus');
      expect(result.urgencyLevel).toBe('consult_24h');
      expect(result.colorCode).toBe('orange');
    });

    it('should detect digestive emergency symptoms', () => {
      const result = analyzeSymptoms('blood in stool and severe nausea');
      expect(result.urgencyLevel).toBe('consult_24h');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty symptoms string gracefully', () => {
      const result = analyzeSymptoms('');
      expect(result.urgencyLevel).toBe('routine');
      expect(result.score).toBe(30);
    });

    it('should handle case-insensitive matching', () => {
      const result = analyzeSymptoms('I have CHEST PAIN and SHORTNESS OF BREATH');
      expect(result.urgencyLevel).toBe('emergency_immediate');
    });

    it('should return correct recommendation structure for each level', () => {
      const emergency = analyzeSymptoms('chest pain');
      expect(emergency.recommendation).toBeDefined();
      expect(emergency.suggestedAction).toBeDefined();
      expect(emergency.requiresAmbulance).toBe(true);
      expect(emergency.colorCode).toBe('red');

      const routine = analyzeSymptoms('I feel okay');
      expect(routine.recommendation).toBeDefined();
      expect(routine.suggestedAction).toBeDefined();
      expect(routine.requiresAmbulance).toBe(false);
      expect(routine.colorCode).toBe('green');
    });
  });
});
