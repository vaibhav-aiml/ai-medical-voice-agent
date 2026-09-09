import { Router } from 'express';
import { sendTestEmail, sendMedicalReportEmail } from '../services/email.service';
import logger from '../utils/logger';

const router = Router();
router.post('/test', async (req, res) => {
  logger.info('Test email request received');
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }
    
    const result = await sendTestEmail(email);
    res.json({ success: true, message: 'Test email sent!', messageId: result.messageId });
  } catch (error: any) {
    logger.error('Email test error', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});
router.post('/send-report', async (req, res) => {
  logger.info('Send report email request received');
  try {
    const result = await sendMedicalReportEmail(req.body);
    res.json({ success: true, message: 'Report sent!', messageId: result.messageId });
  } catch (error: any) {
    logger.error('Email send-report error', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

export default router;