import { Router } from 'express';
import { db } from '../config/database';
import { medicalReports, consultations } from '../db/schema/index';

const router = Router();

// Get report by consultation ID
router.get('/consultation/:consultationId', async (req, res) => {
  try {
    const { consultationId } = req.params;
    const report = await db.select()
      .from(medicalReports)
      .where({ consultationId });
    
    if (!report.length) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json(report[0]);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Get all reports for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userReports = await db.select({
      report: medicalReports,
      consultation: consultations
    })
    .from(medicalReports)
    .innerJoin(consultations, 'consultations.id', '=', 'medicalReports.consultationId')
    .where({ 'consultations.userId': userId });
    
    res.json(userReports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

export default router;