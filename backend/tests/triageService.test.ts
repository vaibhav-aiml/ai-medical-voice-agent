import { describe, it, expect } from 'vitest';
import { analyzeSymptoms } from '../src/services/triageService';

describe('Triage Service Tests', () => {
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
});
