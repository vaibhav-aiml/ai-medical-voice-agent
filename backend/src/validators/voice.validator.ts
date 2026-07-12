import { z } from 'zod';

export const voiceProcessSchema = z.object({
  audioBuffer: z.string().min(1, 'audioBuffer base64 stream is required'), // base64 string
  consultationId: z.string().uuid('consultationId must be a valid UUID'),
  metadata: z.record(z.string(), z.any()).optional(),
});
