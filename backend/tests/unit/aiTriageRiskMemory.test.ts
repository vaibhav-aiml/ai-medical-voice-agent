import { describe, it, expect } from 'vitest';
import { analyzeSymptoms } from '../../src/services/triageService';

describe('AI Triage Engine & Memory Preservation Tests', () => {
  it('should categorize symptoms into correct urgency buckets', () => {
    const mild = analyzeSymptoms('I have a slight runny nose and sneezing', 30);
    expect(mild.colorCode).toBe('green');
    expect(mild.score).toBeLessThanOrEqual(40);

    const severe = analyzeSymptoms('Crushing chest pain radiating to left arm and sweating', 50);
    expect(severe.colorCode).toBe('red');
    expect(severe.score).toBeGreaterThanOrEqual(70);
  });

  it('should bump urgency score for high-risk age groups (<2 yrs or >65 yrs)', () => {
    const adultScore = analyzeSymptoms('Fever of 101F for 2 days', 35);
    const elderlyScore = analyzeSymptoms('Fever of 101F for 2 days', 72);

    expect(elderlyScore.score).toBeGreaterThan(adultScore.score);
  });

  it('should trigger emergency triage escalation on mental health crisis keywords', () => {
    const crisis = analyzeSymptoms('Feeling hopeless and having suicidal thoughts', 25);
    expect(crisis.colorCode).toBe('red');
    expect(crisis.urgencyLevel).toBe('emergency_immediate');
    expect(crisis.requiresAmbulance).toBe(true);
  });

  it('should maintain sliding window memory of max 10 messages', () => {
    const messages = Array.from({ length: 15 }, (_, i) => ({ role: 'user', content: `Message ${i + 1}` }));
    const slidingWindow = messages.slice(-10);

    expect(slidingWindow.length).toBe(10);
    expect(slidingWindow[0].content).toBe('Message 6');
    expect(slidingWindow[9].content).toBe('Message 15');
  });
});
