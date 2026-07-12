import { Router, Request, Response } from 'express';
import { validate } from '../middleware/validate';
import { voiceProcessSchema } from '../validators/voice.validator';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

// Process voice (placeholder - actual processing is done via WebSocket)
router.post('/process', validate(voiceProcessSchema), catchAsync(async (req: Request, res: Response) => {
  const { audioBuffer, consultationId } = req.body;
  res.json({ success: true, message: 'Audio received and queued for processing' });
}));

export default router;