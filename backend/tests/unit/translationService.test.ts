import { describe, it, expect } from 'vitest';
import { translateText } from '../../src/services/translationService';

describe('Translation Service Tests', () => {
  it('should bypass translation if target language matches source language', async () => {
    const result = await translateText('Hello doctor', 'en', 'en');
    expect(result.translatedText).toBe('Hello doctor');
    expect(result.sourceLang).toBe('en');
    expect(result.targetLang).toBe('en');
  });

  it('should return empty translatedText for empty text inputs', async () => {
    const result = await translateText('', 'hi', 'en');
    expect(result.translatedText).toBe('');
  });

  it('should prefix translatedText in mock mode to check translation pathways', async () => {
    // In mock mode, we expect prefixing format like "[Translated to Hindi] Hello doctor"
    const result = await translateText('Hello doctor', 'hi', 'en');
    expect(result.translatedText).toContain('Translated to Hindi');
    expect(result.translatedText).toContain('Hello doctor');
    expect(result.targetLang).toBe('hi');
  });
});
