import { z } from 'zod';

export const detectEmotionSchema = z.object({
  text: z.string().min(1, 'Text is required for emotion detection'),
  consultationId: z.string().uuid('consultationId must be a valid UUID').optional(),
});
