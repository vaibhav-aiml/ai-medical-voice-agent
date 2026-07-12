import { Router, Request, Response } from 'express';
import { db } from '../config/database';
import { medicalReports, consultations, users } from '../db/schema/index';
import { eq } from 'drizzle-orm';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const router = Router();

// Get report by consultation ID
router.get('/consultation/:consultationId', catchAsync(async (req: Request, res: Response) => {
  const { consultationId } = req.params;
  const report = await db.select()
    .from(medicalReports)
    .where(eq(medicalReports.consultationId, consultationId as string));
  
  if (!report.length) {
    throw new AppError('Report not found', 404);
  }
  
  res.json(report[0]);
}));

// Get all reports for a user (Clerk ID)
router.get('/user/:userId', catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params; // Clerk ID
  
  // Find internal UUID for the Clerk user
  const dbUser = await db.select().from(users).where(eq(users.clerkId, userId as string));
  if (dbUser.length === 0) {
    return res.json([]);
  }

  const userReports = await db.select({
    id: medicalReports.id,
    consultationId: medicalReports.consultationId,
    symptoms: medicalReports.symptoms,
    diagnosis: medicalReports.diagnosis,
    recommendations: medicalReports.recommendations,
    medications: medicalReports.medications,
    followUpNeeded: medicalReports.followUpNeeded,
    followUpDate: medicalReports.followUpDate,
    reportUrl: medicalReports.reportUrl,
    generatedAt: medicalReports.generatedAt,
  })
  .from(medicalReports)
  .innerJoin(consultations, eq(consultations.id, medicalReports.consultationId))
  .where(eq(consultations.userId, dbUser[0].id));
  
  res.json(userReports);
}));

export default router;