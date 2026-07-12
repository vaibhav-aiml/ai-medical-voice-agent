import { Router, Request, Response } from 'express';
import { reminderService } from '../services/reminderService';
import { validate } from '../middleware/validate';
import { createMedicationSchema, updateMedicationSchema, setPreferencesSchema } from '../validators/reminder.validator';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const router = Router();

function getParam(param: string | string[] | undefined): string {
  if (!param) return '';
  if (Array.isArray(param)) return param[0];
  return param;
}

router.post('/medication', validate(createMedicationSchema), catchAsync(async (req: Request, res: Response) => {
  const result = reminderService.addMedication(req.body);
  res.json({ success: true, data: result });
}));

router.get('/medications/:userId', catchAsync(async (req: Request, res: Response) => {
  const userId = getParam(req.params.userId);
  const result = reminderService.getUserMedications(userId);
  res.json({ success: true, data: result });
}));

router.put('/medication/:id', validate(updateMedicationSchema), catchAsync(async (req: Request, res: Response) => {
  const id = getParam(req.params.id);
  const result = reminderService.updateMedication(id, req.body);
  if (!result) {
    throw new AppError('Medication not found', 404);
  }
  res.json({ success: true, data: result });
}));

router.delete('/medication/:id', catchAsync(async (req: Request, res: Response) => {
  const id = getParam(req.params.id);
  const result = reminderService.deleteMedication(id);
  res.json({ success: true, data: result });
}));

router.post('/preferences', catchAsync(async (req: Request, res: Response) => {
  const { userId, preferences } = req.body;
  if (!userId) {
    throw new AppError('userId is required', 400);
  }

  // Validate the inner preferences object using Zod schema
  const parsedPrefs = setPreferencesSchema.parse(preferences || {});
  
  const result = reminderService.setUserPreferences(userId, parsedPrefs);
  res.json({ success: true, data: result });
}));

router.get('/preferences/:userId', catchAsync(async (req: Request, res: Response) => {
  const userId = getParam(req.params.userId);
  const result = reminderService.getUserPreferences(userId);
  res.json({ success: true, data: result });
}));

router.post('/acknowledge', catchAsync(async (req: Request, res: Response) => {
  const { reminderId, userId } = req.body;
  if (!reminderId || !userId) {
    throw new AppError('reminderId and userId are required', 400);
  }
  const result = reminderService.acknowledgeReminder(reminderId, userId);
  res.json({ success: true, data: result });
}));

router.get('/stats/:userId', catchAsync(async (req: Request, res: Response) => {
  const userId = getParam(req.params.userId);
  const result = reminderService.getReminderStats(userId);
  res.json({ success: true, data: result });
}));

export default router;