/**
 * Sanitizes and formats text specifically for SpeechSynthesis (TTS).
 * Converts markdown, bullet lists, emojis, and medical abbreviations/units into
 * natural, fluent conversational speech without spoken syntax or symbols.
 */
export function cleanTextForSpeech(text: string): string {
  if (!text || typeof text !== 'string') return '';

  return text
    // 1. Expand common medical units and symbols before punctuation stripping
    .replace(/(\d+)\s*°\s*F/gi, '$1 degrees Fahrenheit')
    .replace(/(\d+)\s*°\s*C/gi, '$1 degrees Celsius')
    .replace(/(\d+)\s*mg\/day/gi, '$1 milligrams per day')
    .replace(/(\d+)\s*mg\b/gi, '$1 milligrams')
    .replace(/(\d+)\s*ml\b/gi, '$1 milliliters')
    .replace(/\bDr\./gi, 'Doctor')
    .replace(/\bvs\./gi, 'versus')
    .replace(/&/g, ' and ')
    .replace(/\//g, ' or ')

    // 2. Strip markdown headers, blockquotes, horizontal rules
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/^-{3,}$/gm, '')

    // 3. Normalize lists (bullet points and numbers) into conversational pauses
    .replace(/^[\s*•▪▫►▸\-+]+\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')

    // 4. Unwrap inline markdown formatting (bold, italic, strikethrough, inline code)
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')

    // 5. Strip markdown links [text](url) -> text, and strip raw URLs
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/gi, '')

    // 6. Strip emojis and pictographs (requires 'u' flag for unicode property escapes)
    .replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F\u200D]/gu, '')

    // 7. Remove lingering markdown characters
    .replace(/[*#_~`|]/g, '')

    // 8. Collapse whitespace and repeated punctuation into natural conversational pauses
    .replace(/\s*\n+\s*/g, '. ')
    .replace(/\.{2,}/g, '.')
    .replace(/\s*([.,!?:;])\s*/g, '$1 ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Splits text into natural sentence chunks for SpeechSynthesis.
 * Prevents the Chromium 15-second utterance truncation bug by ensuring
 * utterances are comfortably sized and cleanly punctuated.
 */
export function splitIntoSentences(text: string, maxChunkLength: number = 180): string[] {
  if (!text || typeof text !== 'string') return [];

  const rawSentences = text.match(/[^.!?]+[.!?]+|\S+$/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of rawSentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (currentChunk.length + trimmed.length + 1 <= maxChunkLength) {
      currentChunk = currentChunk ? `${currentChunk} ${trimmed}` : trimmed;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      if (trimmed.length > maxChunkLength) {
        const subParts = trimmed.match(/[^,;]+[,;]+|\S+$/g) || [trimmed];
        let currentSub = '';
        for (const part of subParts) {
          const partTrimmed = part.trim();
          if (currentSub.length + partTrimmed.length + 1 <= maxChunkLength) {
            currentSub = currentSub ? `${currentSub} ${partTrimmed}` : partTrimmed;
          } else {
            if (currentSub) chunks.push(currentSub);
            currentSub = partTrimmed;
          }
        }
        if (currentSub) chunks.push(currentSub);
        currentChunk = '';
      } else {
        currentChunk = trimmed;
      }
    }
  }

  if (currentChunk) chunks.push(currentChunk);
  return chunks.filter((c) => c.trim().length > 0);
}
