import { describe, it, expect } from 'vitest';
import { cleanTextForSpeech, splitIntoSentences } from '../../src/utils/cleanTextForSpeech';

describe('cleanTextForSpeech utility', () => {
  it('should compile emoji regex with unicode flag without error and strip emojis', () => {
    const raw = 'Take plenty of rest 🛌 and stay hydrated 💧! Consult your doctor 👩‍⚕️ if needed ⚠️.';
    const cleaned = cleanTextForSpeech(raw);
    expect(cleaned).not.toMatch(/[\p{Extended_Pictographic}]/u);
    expect(cleaned).toBe('Take plenty of rest and stay hydrated! Consult your doctor if needed.');
  });

  it('should accurately expand medical units and abbreviations', () => {
    const raw = '**Dosage:** 500mg/day at 101°F 💊';
    const cleaned = cleanTextForSpeech(raw);
    expect(cleaned).toBe('Dosage: 500 milligrams per day at 101 degrees Fahrenheit');

    const tempCelsius = 'If fever reaches 38°C, call Dr. Adams vs. waiting.';
    const cleanedTemp = cleanTextForSpeech(tempCelsius);
    expect(cleanedTemp).toBe('If fever reaches 38 degrees Celsius, call Doctor Adams versus waiting.');
  });

  it('should expand ampersands and slashes and strip markdown syntax', () => {
    const raw = '### Treatment Plan\n• Rest & recovery\n• Take acetaminophen 500mg morning/evening\n• See [clinic](https://hospital.org) for tests';
    const cleaned = cleanTextForSpeech(raw);
    expect(cleaned).toContain('Treatment Plan');
    expect(cleaned).toContain('Rest and recovery');
    expect(cleaned).toContain('Take acetaminophen 500 milligrams morning or evening');
    expect(cleaned).toContain('See clinic for tests');
    expect(cleaned).not.toContain('###');
    expect(cleaned).not.toContain('•');
    expect(cleaned).not.toContain('https://');
  });

  it('should unwrap bold, italic, strikethrough and inline code', () => {
    const raw = 'Please **do not** take *aspirin* if you have `stomach ulcers` or ~~severe heartburn~~.';
    const cleaned = cleanTextForSpeech(raw);
    expect(cleaned).toBe('Please do not take aspirin if you have stomach ulcers or severe heartburn.');
  });

  it('should handle empty or non-string inputs safely', () => {
    expect(cleanTextForSpeech('')).toBe('');
    expect(cleanTextForSpeech(null as any)).toBe('');
    expect(cleanTextForSpeech(undefined as any)).toBe('');
  });

  it('should properly split long text into natural sentence chunks for speech', () => {
    const text = 'First take your medication on time. Drink plenty of water throughout the afternoon. If your headache persists beyond tomorrow, visit a healthcare professional immediately.';
    const chunks = splitIntoSentences(text, 80);
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach(chunk => {
      expect(chunk.length).toBeLessThanOrEqual(100);
      expect(chunk.trim().length).toBeGreaterThan(0);
    });
  });
});
