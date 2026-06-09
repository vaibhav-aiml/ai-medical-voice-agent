import { Router, Request, Response } from 'express';
import { triageService } from '../services/triageService';

const router = Router();

// POST /api/triage/analyze - Analyze symptoms for urgency scoring
router.post('/analyze', (req: Request, res: Response) => {
  try {
    const { symptoms, age, existingConditions } = req.body;
    
    if (!symptoms) {
      return res.status(400).json({ error: 'Symptoms are required' });
    }
    
    const result = triageService.analyzeSymptoms(symptoms, age, existingConditions);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Triage analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze symptoms' });
  }
});

// GET /api/triage/guidelines - Get triage guidelines
router.get('/guidelines', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      levels: {
        emergency_immediate: {
          color: 'red',
          action: 'Call 108 immediately',
          waitTime: '0 hours'
        },
        consult_24h: {
          color: 'orange',
          action: 'See doctor within 24 hours',
          waitTime: '24 hours'
        },
        consult_48h: {
          color: 'yellow',
          action: 'Schedule appointment within 48 hours',
          waitTime: '48 hours'
        },
        routine: {
          color: 'green',
          action: 'Monitor symptoms',
          waitTime: '5-7 days'
        }
      }
    }
  });
});

export default router;