import { describe, it, expect } from 'vitest';
import { detectEmotionFromSpeech } from '../../src/services/emotionService';

describe('Emotion Detection Service Tests', () => {
  it('should detect stress from stressed text inputs', async () => {
    const result = await detectEmotionFromSpeech('I am under so much pressure, stressed and overwhelmed with work.');
    expect(result.emotion).toBe('stress');
    expect(result.confidence).toBeGreaterThan(0.5);
    expect(result.scores.stress).toBeGreaterThan(0.5);
  });

  it('should detect anxiety from anxious text inputs', async () => {
    const result = await detectEmotionFromSpeech('I feel extremely nervous and anxious about this pain in my stomach.');
    expect(result.emotion).toBe('anxiety');
    expect(result.confidence).toBeGreaterThan(0.5);
    expect(result.scores.anxiety).toBeGreaterThan(0.5);
  });

  it('should detect happiness from happy text inputs', async () => {
    const result = await detectEmotionFromSpeech('I feel great today, very happy and much better!');
    expect(result.emotion).toBe('happiness');
    expect(result.confidence).toBeGreaterThan(0.5);
    expect(result.scores.happiness).toBeGreaterThan(0.5);
  });

  it('should return neutral for empty or blank text inputs', async () => {
    const result = await detectEmotionFromSpeech('');
    expect(result.emotion).toBe('neutral');
    expect(result.confidence).toBe(1.0);
  });
});
