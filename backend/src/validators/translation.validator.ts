import { z } from 'zod';

export const translateTextSchema = z.object({
  text: z.string().min(1, 'Text is required for translation'),
  targetLang: z.string().min(2, 'targetLang must be at least 2 characters'),
  sourceLang: z.string().min(2, 'sourceLang must be at least 2 characters').optional(),
});
