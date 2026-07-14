import { OpenAI } from 'openai';
import Groq from 'groq-sdk';
import logger from '../utils/logger';
import { phiService } from './phiService';

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
      logger.info('Translation Service: Groq client initialized');
    } catch (error) {
      logger.warn('Translation Service: Failed to initialize Groq client');
    }
  }

  if (aiProvider === 'mock' && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
    try {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      aiProvider = 'openai';
      logger.info('Translation Service: OpenAI client initialized');
    } catch (error) {
      logger.warn('Translation Service: Failed to initialize OpenAI client');
    }
  }

  if (aiProvider === 'mock') {
    logger.info('Translation Service: Using mock/pass-through mode for translations');
    useMockAI = true;
  }
}

init();

const languageNames: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  bn: 'Bengali',
  ta: 'Tamil',
  te: 'Telugu',
  mr: 'Marathi',
  gu: 'Gujarati',
  kn: 'Kannada',
  ml: 'Malayalam',
  pa: 'Punjabi',
};

export async function translateText(
  text: string,
  targetLang: string,
  sourceLang?: string
): Promise<{
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}> {
  const normTarget = targetLang.toLowerCase();
  const normSource = sourceLang?.toLowerCase() || 'en';

  if (!text || text.trim().length === 0) {
    return { translatedText: '', sourceLang: normSource, targetLang: normTarget };
  }

  if (normTarget === normSource) {
    return { translatedText: text, sourceLang: normSource, targetLang: normTarget };
  }

  const targetLangName = languageNames[normTarget] || normTarget;
  const sourceLangName = languageNames[normSource] || normSource;

  if (useMockAI) {
    logger.debug('Translation Service: Running mock translation (pass-through)');
    // Simply prefix in mock mode to verify logic path
    return {
      translatedText: `[Translated to ${targetLangName}] ${text}`,
      sourceLang: normSource,
      targetLang: normTarget
    };
  }

  const systemPrompt = `You are an expert clinical medical translator. Translate the user's message from ${sourceLangName} to ${targetLangName}.
Ensure high clinical accuracy and natural medical syntax.
Provide ONLY the raw translated text. Do NOT include any explanations, introduction, context, quotes, or markdown wrappers.`;

  try {
    const cleanText = await phiService.prepareTextForAI(text, 'translation-system', 'translation-session');
    let translatedText = '';

    if (aiProvider === 'groq' && groq) {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: cleanText }
        ],
        temperature: 0.1,
        max_tokens: 600
      });
      translatedText = completion.choices[0]?.message?.content?.trim() || '';
    } else if (aiProvider === 'openai' && openai) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: cleanText }
        ],
        temperature: 0.1,
        max_tokens: 600
      });
      translatedText = completion.choices[0]?.message?.content?.trim() || '';
    }

    if (translatedText) {
      return {
        translatedText,
        sourceLang: normSource,
        targetLang: normTarget
      };
    }
  } catch (error: any) {
    logger.error('Failed to translate text using LLM client', { error: error.message });
  }

  // Fallback to mock prefix if API fails
  return {
    translatedText: `[Translation Fallback] ${text}`,
    sourceLang: normSource,
    targetLang: normTarget
  };
}
