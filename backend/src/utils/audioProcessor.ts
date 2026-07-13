import logger from './logger';

/**
 * Extracts a normalized 128-dimensional speaker embedding vector from raw audio buffer data.
 * Computes energy levels across 128 temporal/spectral buckets and normalizes to unit length.
 */
export function extractVoiceEmbedding(audioBuffer: Buffer): number[] {
  const vectorSize = 128;
  const embedding = new Array<number>(vectorSize).fill(0);

  if (!audioBuffer || audioBuffer.length === 0) {
    return embedding;
  }

  // Iterate through the buffer and accumulate byte values into 128 buckets
  const binSize = Math.max(1, Math.floor(audioBuffer.length / vectorSize));
  for (let i = 0; i < audioBuffer.length; i++) {
    const bucket = Math.min(vectorSize - 1, Math.floor(i / binSize));
    // Retrieve energy by subtracting DC bias (128 for unsigned PCM bytes)
    embedding[bucket] += Math.abs(audioBuffer[i] - 128);
  }

  // Calculate L2 norm (Euclidean length)
  let sumSq = 0;
  for (const val of embedding) {
    sumSq += val * val;
  }
  const norm = Math.sqrt(sumSq) || 1;

  // Normalize to unit length (L2 normalization)
  for (let i = 0; i < vectorSize; i++) {
    embedding[i] = embedding[i] / norm;
  }

  return embedding;
}

/**
 * Calculates the Cosine Similarity between two 128-dimensional embedding vectors.
 * Returns a value between -1.0 and 1.0 (typically 0.0 to 1.0 for normalized energy vectors).
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) {
    logger.warn('Vectors have mismatched lengths or are empty');
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}
