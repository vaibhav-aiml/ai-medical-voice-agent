import { describe, it, expect } from 'vitest';
import { extractVoiceEmbedding, calculateCosineSimilarity } from '../../src/utils/audioProcessor';

describe('Voice Biometrics Unit Tests', () => {
  it('should extract voice embedding from audio buffer and normalize to unit length', () => {
    const mockAudio = Buffer.alloc(1000);
    // Fill with some data
    for (let i = 0; i < mockAudio.length; i++) {
      mockAudio[i] = Math.floor(Math.random() * 256);
    }

    const embedding = extractVoiceEmbedding(mockAudio);
    expect(embedding).toHaveLength(128);

    // Calculate L2 norm of the resulting vector
    let sumSq = 0;
    for (const val of embedding) {
      sumSq += val * val;
    }
    const l2Norm = Math.sqrt(sumSq);
    expect(l2Norm).toBeCloseTo(1.0, 5); // Must be L2 normalized to 1
  });

  it('should calculate perfect cosine similarity for identical vectors', () => {
    const vecA = [0.5, 0.5, 0.5, 0.5];
    const similarity = calculateCosineSimilarity(vecA, vecA);
    expect(similarity).toBeCloseTo(1.0, 5);
  });

  it('should calculate zero similarity for orthogonal vectors', () => {
    const vecA = [1.0, 0.0];
    const vecB = [0.0, 1.0];
    const similarity = calculateCosineSimilarity(vecA, vecB);
    expect(similarity).toBe(0.0);
  });
});
