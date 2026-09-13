import Groq from 'groq-sdk';
import logger from '../utils/logger';
import { phiService } from './phiService';
import { triageService, TriageResult } from './triageService';
import { getSystemPrompt, getPhotoAnalysisPromptExtension } from '../sockets/helpers/prompts';

export interface PhotoAnalysisOptions {
  imageBase64: string;
  specialistType?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  language?: string;
  caption?: string;
  userId?: string;
  consultationId?: string;
}

export interface PhotoAnalysisSuccess {
  success: true;
  analysis: string;
  triageResult: TriageResult;
}

export interface PhotoAnalysisFailure {
  success: false;
  error: string;
}

export type PhotoAnalysisResponse = PhotoAnalysisSuccess | PhotoAnalysisFailure;

export const PHOTO_ANALYSIS_MODEL = process.env.PHOTO_ANALYSIS_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';

/**
 * Analyzes a photograph of a visible symptom using Groq's multimodal vision model.
 * 
 * Safety & Triage Architecture:
 * - Employs non-diagnostic, hedged language instructions to describe rather than diagnose.
 * - Primary triage happens on the client when the patient provides a text caption.
 * - Secondary triage runs on the backend against the model's generated response text as a
 *   safety net/backstop (essential when no caption is supplied).
 * - There is no vision-capable fallback model on Groq; if the call fails, an explicit user-facing
 *   error message is returned directing the user to text or voice mode.
 */
export async function getPhotoAnalysis(options: PhotoAnalysisOptions): Promise<PhotoAnalysisResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your-groq-api-key-here') {
    logger.warn('Groq API key not configured for photo analysis');
    return {
      success: false,
      error: 'Photo analysis is temporarily unavailable. Please describe your symptoms using text or voice mode instead.'
    };
  }

  try {
    const specialistType = options.specialistType || 'general';
    const language = options.language || 'en';
    const systemPrompt = `${getSystemPrompt(specialistType, undefined, language)}\n${getPhotoAnalysisPromptExtension()}`;

    // Clean PHI from optional caption if provided
    let cleanCaption: string | undefined = undefined;
    if (options.caption && options.caption.trim()) {
      try {
        cleanCaption = await phiService.prepareTextForAI(
          options.caption.trim(),
          options.userId || 'anonymous',
          options.consultationId || 'photo-session'
        );
      } catch (phiErr: any) {
        logger.warn('PHI scrubbing failed on photo caption; proceeding with trimmed caption', { error: phiErr.message });
        cleanCaption = options.caption.trim();
      }
    }

    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    if (options.conversationHistory && options.conversationHistory.length > 0) {
      const recent = options.conversationHistory.slice(-6);
      for (const msg of recent) {
        if ((msg.role === 'user' || msg.role === 'assistant') && typeof msg.content === 'string') {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
    if (cleanCaption) {
      userContent.push({
        type: 'text',
        text: `Patient notes: "${cleanCaption}". Please analyze this photo of my symptom.`
      });
    } else {
      userContent.push({
        type: 'text',
        text: 'Please analyze this photo of my symptom.'
      });
    }

    userContent.push({
      type: 'image_url',
      image_url: {
        url: `data:image/jpeg;base64,${options.imageBase64}`
      }
    });

    messages.push({ role: 'user', content: userContent });

    const groq = new Groq({ apiKey });
    const modelToUse = process.env.PHOTO_ANALYSIS_MODEL || PHOTO_ANALYSIS_MODEL;
    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: modelToUse,
        messages: messages as any,
        temperature: 0.5,
        max_tokens: 800,
      });
    } catch (modelErr: any) {
      logger.error('Photo analysis model call failed', { model: modelToUse, error: modelErr.message, status: modelErr?.status });
      throw modelErr;
    }

    const analysis = completion.choices[0]?.message?.content;
    if (!analysis) {
      throw new Error('Empty response received from Groq vision model');
    }

    // Secondary safety net: triage check against AI response text
    // (Primary check occurs on the frontend if user provided caption text)
    const triageResult = triageService.analyzeSymptoms(analysis);

    return {
      success: true,
      analysis,
      triageResult
    };
  } catch (error: any) {
    logger.error('Photo analysis failed via Groq vision model', {
      error: error?.message || String(error),
      consultationId: options.consultationId
    });

    return {
      success: false,
      error: 'Photo analysis is temporarily unavailable. Please describe your symptoms using text or voice mode instead.'
    };
  }
}

export const photoAnalysisService = {
  getPhotoAnalysis
};
