import { Router } from 'express';
import { sendTestEmail, sendMedicalReportEmail } from '../services/email.service';

const router = Router();

// Test email endpoint
router.post('/test', async (req, res) => {
  console.log('📧 Test email request received');
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }
    
    const result = await sendTestEmail(email);
    res.json({ success: true, message: 'Test email sent!', messageId: result.messageId });
  } catch (error: any) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Send medical report email
router.post('/send-report', async (req, res) => {
  console.log('📧 Send report request received');
  try {
    const result = await sendMedicalReportEmail(req.body);
    res.json({ success: true, message: 'Report sent!', messageId: result.messageId });
  } catch (error: any) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;