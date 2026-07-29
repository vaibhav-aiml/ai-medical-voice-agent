import logger from './logger';
export function extractVoiceEmbedding(audioBuffer: Buffer): number[] {
  const vectorSize = 128;
  const embedding = new Array<number>(vectorSize).fill(0);

  if (!audioBuffer || audioBuffer.length === 0) {
    return embedding;
  }
  const binSize = Math.max(1, Math.floor(audioBuffer.length / vectorSize));
  for (let i = 0; i < audioBuffer.length; i++) {
    const bucket = Math.min(vectorSize - 1, Math.floor(i / binSize));
    
    embedding[bucket] += Math.abs(audioBuffer[i] - 128);
  }
  let sumSq = 0;
  for (const val of embedding) {
    sumSq += val * val;
  }
  const norm = Math.sqrt(sumSq) || 1;
  for (let i = 0; i < vectorSize; i++) {
    embedding[i] = embedding[i] / norm;
  }

  return embedding;
}
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