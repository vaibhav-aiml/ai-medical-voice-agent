import { Router, Request, Response } from 'express';

const router = Router();

// Store HIPAA logs in memory (use database in production)
const hipaaLogs: any[] = [];

// POST /api/hipaa/log
router.post('/log', (req: Request, res: Response) => {
  try {
    const logEntry = req.body;
    logEntry.receivedAt = new Date().toISOString();
    hipaaLogs.push(logEntry);
    
    console.log(`[HIPAA] ${logEntry.type} accessed by ${logEntry.accessedBy}`);
    
    // Keep only last 10,000 logs
    if (hipaaLogs.length > 10000) {
      hipaaLogs.shift();
    }
    
    res.status(200).json({ success: true, message: 'HIPAA log received' });
  } catch (error) {
    console.error('Error saving HIPAA log:', error);
    res.status(500).json({ success: false, error: 'Failed to save HIPAA log' });
  }
});

// GET /api/hipaa/logs (for admin)
router.get('/logs', (req: Request, res: Response) => {
  res.status(200).json({ success: true, logs: hipaaLogs });
});

export default router;