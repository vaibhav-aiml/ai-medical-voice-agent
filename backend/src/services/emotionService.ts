import { OpenAI } from 'openai';
import Groq from 'groq-sdk';
import logger from '../utils/logger';

let groq: Groq | null = null;
let openai: OpenAI | null = null;
let useMockAI: boolean = false;
let aiProvider: 'groq' | 'openai' | 'mock' = 'mock';

function init() {
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your-groq-api-key-here' && process.env.GROQ_API_KEY.startsWith('gsk_')) {
    try {
      groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
      });
      aiProvider = 'groq';
      logger.info('Emotion Service: Groq client initialized');
    } catch (error) {
      logger.warn('Emotion Service: Failed to initialize Groq client');
    }
  }

  if (aiProvider === 'mock' && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
    try {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      aiProvider = 'openai';
      logger.info('Emotion Service: OpenAI client initialized');
    } catch (error) {
      logger.warn('Emotion Service: Failed to initialize OpenAI client');
    }
  }

  if (aiProvider === 'mock') {
    logger.info('Emotion Service: Using mock/heuristic mode for emotion detection');
    useMockAI = true;
  }
}

init();

export interface EmotionResult {
  emotion: 'stress' | 'anxiety' | 'happiness' | 'sadness' | 'anger' | 'fear' | 'neutral';
  confidence: number;
  scores: {
    stress: number;
    anxiety: number;
    happiness: number;
    sadness: number;
    anger: number;
    fear: number;
    neutral: number;
  };
}

// Simple rule-based heuristic fallback if AI calls fail or in mock mode
function getHeuristicEmotion(text: string): EmotionResult {
  const normalized = text.toLowerCase();
  const scores = {
    stress: 0.1,
    anxiety: 0.1,
    happiness: 0.1,
    sadness: 0.1,
    anger: 0.1,
    fear: 0.1,
    neutral: 0.4
  };

  // Rule mappings
  if (normalized.includes('chest pain') || normalized.includes('breath') || normalized.includes('choking') || normalized.includes('scared') || normalized.includes('afraid')) {
    scores.fear = 0.6;
    scores.anxiety = 0.3;
  } else if (normalized.includes('worry') || normalized.includes('nervous') || normalized.includes('panic') || normalized.includes('anxious') || normalized.includes('tense')) {
    scores.anxiety = 0.7;
    scores.stress = 0.2;
  } else if (normalized.includes('stress') || normalized.includes('pressure') || normalized.includes('tired') || normalized.includes('exhausted') || normalized.includes('overwhelm')) {
    scores.stress = 0.8;
    scores.anxiety = 0.1;
  } else if (normalized.includes('sad') || normalized.includes('cry') || normalized.includes('depressed') || normalized.includes('hopeless') || normalized.includes('lonely')) {
    scores.sadness = 0.8;
    scores.neutral = 0.1;
  } else if (normalized.includes('angry') || normalized.includes('frustrated') || normalized.includes('mad') || normalized.includes('annoyed') || normalized.includes('hate')) {
    scores.anger = 0.8;
    scores.stress = 0.1;
  } else if (normalized.includes('happy') || normalized.includes('good') || normalized.includes('great') || normalized.includes('excellent') || normalized.includes('glad') || normalized.includes('better')) {
    scores.happiness = 0.8;
    scores.neutral = 0.1;
  }

  // Find max emotion
  let maxVal = -1;
  let dominant: keyof typeof scores = 'neutral';
  for (const [em, val] of Object.entries(scores)) {
    if (val > maxVal) {
      maxVal = val;
      dominant = em as keyof typeof scores;
    }
  }

  return {
    emotion: dominant,
    confidence: maxVal,
    scores
  };
}

export async function detectEmotionFromSpeech(text: string, assemblyAISentiment?: any): Promise<EmotionResult> {
  if (!text || text.trim().length === 0) {
    return {
      emotion: 'neutral',
      confidence: 1.0,
      scores: { stress: 0, anxiety: 0, happiness: 0, sadness: 0, anger: 0, fear: 0, neutral: 1.0 }
    };
  }

  if (useMockAI) {
    logger.debug('Emotion Service: Running heuristic classification');
    return getHeuristicEmotion(text);
  }

  const systemPrompt = `You are a clinical psychology AI expert specializing in emotional state estimation from clinical consultations.
Analyze the patient's transcription and classify their dominant emotional state into exactly one of: 'stress', 'anxiety', 'happiness', 'sadness', 'anger', 'fear', 'neutral'.
Provide a confidence score between 0.0 and 1.0, and relative probability scores for each emotion summing to approximately 1.0.

Your output must be JSON matching this TypeScript structure:
{
  "emotion": "stress" | "anxiety" | "happiness" | "sadness" | "anger" | "fear" | "neutral",
  "confidence": number,
  "scores": {
    "stress": number,
    "anxiety": number,
    "happiness": number,
    "sadness": number,
    "anger": number,
    "fear": number,
    "neutral": number
  }
}`;

  try {
    let responseText = '';

    if (aiProvider === 'groq' && groq) {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Patient text to analyze: "${text}"` }
        ],
        temperature: 0.2,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      });
      responseText = completion.choices[0]?.message?.content || '';
    } else if (aiProvider === 'openai' && openai) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Patient text to analyze: "${text}"` }
        ],
        temperature: 0.2,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      });
      responseText = completion.choices[0]?.message?.content || '';
    }

    if (responseText) {
      const parsed = JSON.parse(responseText);
      // Validate schema
      if (
        parsed.emotion &&
        ['stress', 'anxiety', 'happiness', 'sadness', 'anger', 'fear', 'neutral'].includes(parsed.emotion) &&
        typeof parsed.confidence === 'number' &&
        parsed.scores
      ) {
        // Normalize any incoming AssemblyAI sentiment if provided
        if (assemblyAISentiment) {
          logger.info('Integrating AssemblyAI sentiment data with LLM analysis');
          // e.g. adjust confidence based on AssemblyAI speech analysis
        }

        return parsed as EmotionResult;
      }
    }
  } catch (error: any) {
    logger.error('Failed to detect emotion using LLM client', { error: error.message });
  }

  // Fallback to rules if API fails
  return getHeuristicEmotion(text);
}
