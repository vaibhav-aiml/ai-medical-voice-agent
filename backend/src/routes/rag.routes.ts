import { Router, Request, Response } from 'express';
import { ragKnowledgeBase } from '../services/ragKnowledgeBase';

const router = Router();
router.post('/search', (req: Request, res: Response) => {
  try {
    const { symptoms, limit } = req.body;
    
    if (!symptoms) {
      return res.status(400).json({ error: 'Symptoms are required' });
    }
    
    const results = ragKnowledgeBase.searchKnowledge(symptoms, limit || 3);
    
    res.json({
      success: true,
      data: results,
      count: results.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('RAG search error:', error);
    res.status(500).json({ error: 'Failed to search knowledge base' });
  }
});
router.post('/enhance', (req: Request, res: Response) => {
  try {
    const { symptoms, userMessage } = req.body;
    
    if (!symptoms) {
      return res.status(400).json({ error: 'Symptoms are required' });
    }
    
    const enhancedResponse = ragKnowledgeBase.generateEnhancedResponse(symptoms, userMessage || symptoms);
    
    res.json({
      success: true,
      data: {
        response: enhancedResponse,
        sources: ['Medical Literature', 'CDC Guidelines', 'Mayo Clinic']
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('RAG enhance error:', error);
    res.status(500).json({ error: 'Failed to generate enhanced response' });
  }
});
router.get('/emergency', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      guidance: ragKnowledgeBase.getEmergencyGuidance(),
      emergencyNumbers: {
        ambulance: '108',
        nationalEmergency: '112',
        police: '100',
        fire: '101'
      }
    },
    timestamp: new Date().toISOString()
  });
});
router.get('/conditions', (req: Request, res: Response) => {
  const conditions = ragKnowledgeBase.searchKnowledge('', 100);
  res.json({
    success: true,
    data: conditions.map(c => ({
      condition: c.condition,
      symptoms: c.symptoms,
      source: c.source
    })),
    count: conditions.length
  });
});

export default router;