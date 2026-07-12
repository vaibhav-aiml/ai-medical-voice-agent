import { Router, Request, Response } from 'express';
import { db } from '../config/database';
import { consultations, users } from '../db/schema/index';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { validate } from '../middleware/validate';
import { createConsultationSchema, saveConsultationSchema } from '../validators/consultation.validator';

const router = Router();

// Helper to get or create DB user from Clerk ID
async function getOrCreateInternalUserId(clerkId: string, email?: string, name?: string): Promise<string> {
  try {
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.clerkId, clerkId));

    if (existingUser.length > 0) {
      return existingUser[0].id;
    }

    // Create user on the fly if not found
    const newUser = await db.insert(users).values({
      clerkId: clerkId,
      email: email || `${clerkId}@example.com`,
      name: name || 'MediVoice Patient',
    }).returning();

    logger.info(`Created new user record for Clerk ID: ${clerkId}`);
    return newUser[0].id;
  } catch (error: any) {
    logger.error('Failed in getOrCreateInternalUserId', { clerkId, error: error.message });
    throw new AppError('Database user resolution failed', 500);
  }
}

// Start new consultation
router.post('/start', validate(createConsultationSchema), catchAsync(async (req: Request, res: Response) => {
  const { userId, specialistType, symptoms, notes, email, name } = req.body;
  
  const clerkId = userId;
  const internalUserId = await getOrCreateInternalUserId(clerkId, email, name);
  
  const consultation = await db.insert(consultations).values({
    id: uuidv4(),
    userId: internalUserId,
    specialistType,
    symptoms: symptoms || '',
    notes: notes || '',
    status: 'active',
    startedAt: new Date(),
  }).returning();
  
  logger.info(`Started consultation: ${consultation[0].id} for user: ${clerkId}`);
  res.json({ success: true, consultation: consultation[0] });
}));

// Save completed consultation (direct frontend request fallback)
router.post('/save', validate(saveConsultationSchema), catchAsync(async (req: Request, res: Response) => {
  const { id, userId, specialistType, specialistName, status, symptoms, notes, duration, startedAt, endedAt, email, name } = req.body;
  
  const internalUserId = await getOrCreateInternalUserId(userId, email, name);
  const formattedDuration = duration ? duration.toString() : '0';

  const consultation = await db.insert(consultations).values({
    id: id || uuidv4(),
    userId: internalUserId,
    specialistType: specialistType || 'general',
    specialistName: specialistName || null,
    status: status || 'completed',
    symptoms: symptoms || '',
    notes: notes || '',
    duration: formattedDuration,
    startedAt: startedAt ? new Date(startedAt) : new Date(),
    endedAt: endedAt ? new Date(endedAt) : null,
  }).returning();
  
  logger.info(`Saved consultation: ${consultation[0].id} for user: ${userId}`);
  res.json({ success: true, consultation: consultation[0] });
}));

// End consultation
router.post('/:id/end', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { duration, notes } = req.body;

  const result = await db.update(consultations)
    .set({ 
      status: 'completed', 
      endedAt: new Date(),
      duration: duration ? duration.toString() : null,
      notes: notes || 'Consultation completed.'
    })
    .where(eq(consultations.id, id as string))
    .returning();
  
  if (result.length === 0) {
    throw new AppError('Consultation not found', 404);
  }

  logger.info(`Ended consultation: ${id}`);
  res.json({ success: true, message: 'Consultation ended successfully', consultation: result[0] });
}));

// Get user's consultation history
router.get('/user/:userId', catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  const dbUser = await db.select().from(users).where(eq(users.clerkId, userId as string));
  if (dbUser.length === 0) {
    return res.json([]);
  }

  const userConsultations = await db.select()
    .from(consultations)
    .where(eq(consultations.userId, dbUser[0].id))
    .orderBy(consultations.startedAt);
  
  res.json(userConsultations);
}));

// Get single consultation by ID
router.get('/:id', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const consultation = await db.select()
    .from(consultations)
    .where(eq(consultations.id, id as string));
  
  if (!consultation.length) {
    throw new AppError('Consultation not found', 404);
  }
  
  res.json(consultation[0]);
}));

// Delete consultation
router.delete('/:id', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await db.delete(consultations)
    .where(eq(consultations.id, id as string))
    .returning();

  if (result.length === 0) {
    throw new AppError('Consultation not found', 404);
  }
  
  logger.info(`Deleted consultation: ${id}`);
  res.json({ success: true, message: 'Consultation deleted' });
}));

export default router;