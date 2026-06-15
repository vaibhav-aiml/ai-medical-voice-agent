import { Router, Request, Response } from 'express';
import { analyticsService } from '../services/analyticsService';

const router = Router();

// Get analytics dashboard data
router.post('/dashboard', async (req: Request, res: Response) => {
  try {
    const { consultations, ratings } = req.body;
    
    if (!consultations || !Array.isArray(consultations)) {
      return res.status(400).json({ success: false, error: 'Consultations data is required' });
    }
    
    const analytics = analyticsService.generateAnalytics(consultations, ratings);
    
    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to generate analytics' });
  }
});

// Get consultation trends over time
router.post('/trends', async (req: Request, res: Response) => {
  try {
    const { consultations } = req.body;
    const trends = analyticsService.generateAnalytics(consultations, {}).consultationTrends;
    res.json({ success: true, data: trends });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch trends' });
  }
});

// Get common symptoms analysis
router.post('/symptoms', async (req: Request, res: Response) => {
  try {
    const { consultations } = req.body;
    const analytics = analyticsService.generateAnalytics(consultations, {});
    res.json({ success: true, data: analytics.commonSymptoms });
  } catch (error) {
    console.error('Error fetching symptoms:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch symptoms' });
  }
});

export default router;