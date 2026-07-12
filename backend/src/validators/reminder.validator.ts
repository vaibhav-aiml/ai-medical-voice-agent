import { z } from 'zod';

export const createMedicationSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  name: z.string().min(1, 'Medication name is required').max(100, 'Medication name too long'),
  dosage: z.string().min(1, 'Dosage description is required'),
  frequency: z.enum(['daily', 'twice_daily', 'thrice_daily', 'weekly', 'custom']).default('daily'),
  times: z.array(z.string().regex(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format')).min(1, 'At least one reminder time is required'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export const updateMedicationSchema = z.object({
  name: z.string().min(1, 'Medication name cannot be empty').max(100).optional(),
  dosage: z.string().min(1, 'Dosage description cannot be empty').optional(),
  frequency: z.enum(['daily', 'twice_daily', 'thrice_daily', 'weekly', 'custom']).optional(),
  times: z.array(z.string().regex(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format')).optional(),
  notes: z.string().max(500).optional(),
  active: z.boolean().optional(),
});

export const setPreferencesSchema = z.object({
  emailEnabled: z.boolean().default(false),
  emailAddress: z.string().email('Invalid email address').optional(),
  smsEnabled: z.boolean().default(false),
  phoneNumber: z.string().optional(),
  whatsappEnabled: z.boolean().default(false),
  pushEnabled: z.boolean().default(false),
});
