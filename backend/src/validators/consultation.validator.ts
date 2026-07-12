import { z } from 'zod';

export const createConsultationSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  specialistType: z.enum(['general', 'orthopedic', 'cardiologist', 'neurologist', 'pediatrician']),
  symptoms: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  email: z.string().email('Invalid email address').optional(),
  name: z.string().optional(),
});

export const saveConsultationSchema = z.object({
  id: z.string().uuid('Consultation id must be a valid UUID').optional(),
  userId: z.string().min(1, 'userId is required'),
  specialistType: z.string().min(1, 'specialistType is required'),
  specialistName: z.string().optional(),
  status: z.string().optional().default('completed'),
  symptoms: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  duration: z.number().nonnegative('Duration must be a non-negative number').optional(),
  startedAt: z.string().datetime({ message: 'startedAt must be a valid ISO datetime string' }).optional(),
  endedAt: z.string().datetime({ message: 'endedAt must be a valid ISO datetime string' }).optional(),
  email: z.string().email('Invalid email address').optional(),
  name: z.string().optional(),
});
