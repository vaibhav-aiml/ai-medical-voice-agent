import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPhotoAnalysis, PHOTO_ANALYSIS_MODEL } from '../../src/services/photoAnalysisService';

// Mock Groq SDK
const mockCreate = vi.fn();
vi.mock('groq-sdk', () => {
  return {
    default: class MockGroq {
      chat = {
        completions: {
          create: mockCreate
        }
      };
    }
  };
});

// Mock phiService
vi.mock('../../src/services/phiService', () => {
  return {
    phiService: {
      prepareTextForAI: vi.fn(async (text: string) => text.replace(/123-45-6789/g, '[REDACTED]'))
    }
  };
});

describe('photoAnalysisService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, GROQ_API_KEY: 'mock-valid-groq-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns graceful failure message when GROQ_API_KEY is missing or default', async () => {
    process.env.GROQ_API_KEY = '';
    const res = await getPhotoAnalysis({ imageBase64: 'fakebase64data' });
    expect(res.success).toBe(false);
    if (!res.success && 'error' in res) {
      expect(res.error).toContain('temporarily unavailable');
    }
  });

  it('handles Groq API errors gracefully without crashing', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Rate limit exceeded or Groq network down'));
    const res = await getPhotoAnalysis({ imageBase64: 'fakebase64data' });
    expect(res.success).toBe(false);
    if (!res.success && 'error' in res) {
      expect(res.error).toContain('Photo analysis is temporarily unavailable. Please describe your symptoms using text or voice mode instead.');
    }
  });

  it('invokes Groq with vision model and passes hedged system prompt and image data', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: 'The visual features appear consistent with mild skin dryness and flaking. Hydration and moisturizing cream may help.'
          }
        }
      ]
    });

    const res = await getPhotoAnalysis({
      imageBase64: 'validbase64image',
      specialistType: 'general',
      language: 'en'
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.analysis).toContain('mild skin dryness');
      expect(res.triageResult).toBeDefined();
      expect(res.triageResult.urgencyLevel).toBe('routine');
    }

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.model).toBe(PHOTO_ANALYSIS_MODEL);
    
    // Check system prompt contains non-diagnostic guardrails
    const systemMsg = callArgs.messages.find((m: any) => m.role === 'system');
    expect(systemMsg.content).toContain('DESCRIBE, NEVER DIAGNOSE');
    expect(systemMsg.content).toContain('PHOTO ANALYSIS INSTRUCTIONS');

    // Check user content contains image_url
    const userMsg = callArgs.messages.find((m: any) => m.role === 'user');
    const imagePart = userMsg.content.find((p: any) => p.type === 'image_url');
    expect(imagePart.image_url.url).toBe('data:image/jpeg;base64,validbase64image');
  });

  it('includes and scrubs patient caption text when provided', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: 'Visual examination shows minor redness.'
          }
        }
      ]
    });

    const res = await getPhotoAnalysis({
      imageBase64: 'validbase64image',
      caption: 'Rash started yesterday, SSN is 123-45-6789'
    });

    expect(res.success).toBe(true);
    const callArgs = mockCreate.mock.calls[0][0];
    const userMsg = callArgs.messages.find((m: any) => m.role === 'user');
    const textPart = userMsg.content.find((p: any) => p.type === 'text');
    expect(textPart.text).toContain('Patient notes: "Rash started yesterday, SSN is [REDACTED]"');
  });

  it('triggers secondary emergency triage when AI response flags red-flag symptoms', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: 'The image shows signs of severe bleeding and deep tissue laceration. Patient is at risk of hemorrhage.'
          }
        }
      ]
    });

    const res = await getPhotoAnalysis({
      imageBase64: 'validbase64image'
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.triageResult.urgencyLevel).toBe('emergency_immediate');
      expect(res.triageResult.requiresAmbulance).toBe(true);
      expect(res.triageResult.colorCode).toBe('red');
    }
  });
});
