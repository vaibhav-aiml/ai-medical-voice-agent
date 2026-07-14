import { Router, Request, Response } from 'express';
import { reminderService } from '../services/reminderService';
import { validate } from '../middleware/validate';
import { createMedicationSchema, updateMedicationSchema, setPreferencesSchema } from '../validators/reminder.validator';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { requireAuth } from '../middleware/auth';

const router = Router();

function getParam(param: string | string[] | undefined): string {
  if (!param) return '';
  if (Array.isArray(param)) return param[0];
  return param;
}

// Add Clerk requireAuth middleware as default for all routes in this router
router.use(requireAuth);

router.post('/medication', validate(createMedicationSchema), catchAsync(async (req: Request, res: Response) => {
  const authenticatedUserId = (req as any).userId;
  if (req.body.userId !== authenticatedUserId) {
    throw new AppError('Forbidden: Cannot create medications for other users', 403);
  }
  const result = reminderService.addMedication(req.body);
  res.json({ success: true, data: result });
}));

router.get('/medications/:userId', catchAsync(async (req: Request, res: Response) => {
  const userId = getParam(req.params.userId);
  const authenticatedUserId = (req as any).userId;
  if (userId !== authenticatedUserId) {
    throw new AppError('Forbidden: Cannot access other users\' medication records', 403);
  }
  const result = reminderService.getUserMedications(userId);
  res.json({ success: true, data: result });
}));

router.put('/medication/:id', validate(updateMedicationSchema), catchAsync(async (req: Request, res: Response) => {
  const id = getParam(req.params.id);
  const authenticatedUserId = (req as any).userId;
  
  const medication = reminderService.getMedicationById(id);
  if (!medication) {
    throw new AppError('Medication not found', 404);
  }
  if (medication.userId !== authenticatedUserId) {
    throw new AppError('Forbidden: Cannot modify other users\' medication records', 403);
  }

  const result = reminderService.updateMedication(id, req.body);
  res.json({ success: true, data: result });
}));

router.delete('/medication/:id', catchAsync(async (req: Request, res: Response) => {
  const id = getParam(req.params.id);
  const authenticatedUserId = (req as any).userId;

  const medication = reminderService.getMedicationById(id);
  if (!medication) {
    throw new AppError('Medication not found', 404);
  }
  if (medication.userId !== authenticatedUserId) {
    throw new AppError('Forbidden: Cannot delete other users\' medication records', 403);
  }

  const result = reminderService.deleteMedication(id);
  res.json({ success: true, data: result });
}));

router.post('/preferences', catchAsync(async (req: Request, res: Response) => {
  const { userId, preferences } = req.body;
  if (!userId) {
    throw new AppError('userId is required', 400);
  }

  const authenticatedUserId = (req as any).userId;
  if (userId !== authenticatedUserId) {
    throw new AppError('Forbidden: Cannot modify other users\' preferences', 403);
  }

  // Validate the inner preferences object using Zod schema
  const parsedPrefs = setPreferencesSchema.parse(preferences || {});
  
  const result = reminderService.setUserPreferences(userId, parsedPrefs);
  res.json({ success: true, data: result });
}));

router.get('/preferences/:userId', catchAsync(async (req: Request, res: Response) => {
  const userId = getParam(req.params.userId);
  const authenticatedUserId = (req as any).userId;
  if (userId !== authenticatedUserId) {
    throw new AppError('Forbidden: Cannot access other users\' preferences', 403);
  }
  const result = reminderService.getUserPreferences(userId);
  res.json({ success: true, data: result });
}));

router.post('/acknowledge', catchAsync(async (req: Request, res: Response) => {
  const { reminderId, userId } = req.body;
  if (!reminderId || !userId) {
    throw new AppError('reminderId and userId are required', 400);
  }

  const authenticatedUserId = (req as any).userId;
  if (userId !== authenticatedUserId) {
    throw new AppError('Forbidden: Cannot acknowledge reminders for other users', 403);
  }

  const result = reminderService.acknowledgeReminder(reminderId, userId);
  res.json({ success: true, data: result });
}));

router.get('/stats/:userId', catchAsync(async (req: Request, res: Response) => {
  const userId = getParam(req.params.userId);
  const authenticatedUserId = (req as any).userId;
  if (userId !== authenticatedUserId) {
    throw new AppError('Forbidden: Cannot access other users\' stats', 403);
  }
  const result = reminderService.getReminderStats(userId);
  res.json({ success: true, data: result });
}));

export default router;