import { describe, it, expect } from 'vitest';
import Groq from 'groq-sdk';
import { PHOTO_ANALYSIS_MODEL } from '../../src/services/photoAnalysisService';

describe('Live Groq Model Verification (Gated)', () => {
  const isLiveTest = process.env.RUN_LIVE_API_TESTS === 'true';
  const apiKey = process.env.GROQ_API_KEY;

  if (!isLiveTest || !apiKey) {
    it.skip('Skipping live Groq API test (RUN_LIVE_API_TESTS not enabled)', () => {
      expect(true).toBe(true);
    });
    return;
  }

  it('confirms the configured PHOTO_ANALYSIS_MODEL exists on Groq', async () => {
    const groq = new Groq({ apiKey });
    const models = await groq.models.list();
    const modelIds = models.data.map((m: any) => m.id);
    
    expect(modelIds).toContain(PHOTO_ANALYSIS_MODEL);
  }, 15000);
});
