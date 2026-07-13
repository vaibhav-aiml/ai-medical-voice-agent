import { z } from 'zod';

export const enrollVoiceSchema = z.object({
  userId: z.string().uuid('userId must be a valid UUID'),
  audio: z.string().min(1, 'Base64 audio string is required for enrollment'),
});

export const verifyVoiceSchema = z.object({
  userId: z.string().uuid('userId must be a valid UUID'),
  audio: z.string().min(1, 'Base64 audio string is required for verification'),
});
