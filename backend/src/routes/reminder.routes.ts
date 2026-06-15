import { Router, Request, Response } from 'express';
import { reminderService } from '../services/reminderService';

const router = Router();

// Helper function to safely get string from params
function getParam(param: string | string[] | undefined): string {
  if (!param) return '';
  if (Array.isArray(param)) return param[0];
  return param;
}

router.post('/medication', (req: Request, res: Response) => {
  try {
    const result = reminderService.addMedication(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error adding medication:', error);
    res.status(500).json({ success: false, error: 'Failed to add medication' });
  }
});

router.get('/medications/:userId', (req: Request, res: Response) => {
  try {
    const userId = getParam(req.params.userId);
    const result = reminderService.getUserMedications(userId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch medications' });
  }
});

router.put('/medication/:id', (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);
    const result = reminderService.updateMedication(id, req.body);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Medication not found' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating medication:', error);
    res.status(500).json({ success: false, error: 'Failed to update medication' });
  }
});

router.delete('/medication/:id', (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);
    const result = reminderService.deleteMedication(id);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error deleting medication:', error);
    res.status(500).json({ success: false, error: 'Failed to delete medication' });
  }
});

router.post('/preferences', (req: Request, res: Response) => {
  try {
    const { userId, preferences } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }
    const result = reminderService.setUserPreferences(userId, preferences || {});
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error setting preferences:', error);
    res.status(500).json({ success: false, error: 'Failed to set preferences' });
  }
});

router.get('/preferences/:userId', (req: Request, res: Response) => {
  try {
    const userId = getParam(req.params.userId);
    const result = reminderService.getUserPreferences(userId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch preferences' });
  }
});

router.post('/acknowledge', (req: Request, res: Response) => {
  try {
    const { reminderId, userId } = req.body;
    if (!reminderId || !userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'reminderId and userId are required' 
      });
    }
    const result = reminderService.acknowledgeReminder(reminderId, userId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error acknowledging reminder:', error);
    res.status(500).json({ success: false, error: 'Failed to acknowledge reminder' });
  }
});

router.get('/stats/:userId', (req: Request, res: Response) => {
  try {
    const userId = getParam(req.params.userId);
    const result = reminderService.getReminderStats(userId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

export default router;