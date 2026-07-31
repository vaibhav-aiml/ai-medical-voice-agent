/**
 * Deterministic Mock Generators for Groq, OpenAI, and AssemblyAI SDKs
 */

export const createMockGroqStream = (chunks: string[] = ['Hello', ', how', ' can', ' I help?']) => {
  return async function* () {
    for (const chunk of chunks) {
      yield { choices: [{ delta: { content: chunk } }] };
    }
  };
};

export const createMockOpenAIStream = (chunks: string[] = ['OpenAI', ' fallback', ' response']) => {
  return async function* () {
    for (const chunk of chunks) {
      yield { choices: [{ delta: { content: chunk } }] };
    }
  };
};

export const createMockAssemblyAITranscription = (text: string = 'I have a sore throat and fever') => {
  return {
    id: 'transcript-123',
    status: 'completed',
    text,
    confidence: 0.98,
    words: [
      { text: 'I', start: 0, end: 100 },
      { text: 'have', start: 110, end: 250 },
      { text: 'sore', start: 260, end: 400 },
      { text: 'throat', start: 410, end: 600 }
    ]
  };
};
