import { z } from 'zod';

export const analyzeTriageSchema = z.object({
  symptoms: z.string()
    .min(10, 'Symptoms details must be at least 10 characters long')
    .max(2000, 'Symptoms details cannot exceed 2000 characters'),
  age: z.number().int('Age must be an integer').min(0, 'Age cannot be negative').max(120, 'Invalid age value').optional(),
  existingConditions: z.array(z.string()).optional().default([]),
});
