import { Router, Request, Response } from 'express';

const router = Router();

// Store audit logs in memory (or database in production)
const auditLogs: any[] = [];

// POST /api/audit/log
router.post('/log', (req: Request, res: Response) => {
  try {
    const logEntry = req.body;
    logEntry.receivedAt = new Date().toISOString();
    auditLogs.push(logEntry);
    
    console.log(`[AUDIT] ${logEntry.action} - ${logEntry.userId}`);
    
    // Keep only last 10,000 logs
    if (auditLogs.length > 10000) {
      auditLogs.shift();
    }
    
    res.status(200).json({ success: true, message: 'Audit log received' });
  } catch (error) {
    console.error('Error saving audit log:', error);
    res.status(500).json({ success: false, error: 'Failed to save audit log' });
  }
});

// GET /api/audit/logs (for admin)
router.get('/logs', (req: Request, res: Response) => {
  res.status(200).json({ success: true, logs: auditLogs });
});

export default router;