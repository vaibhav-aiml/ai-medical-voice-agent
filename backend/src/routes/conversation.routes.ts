import { Router, Request, Response } from 'express';

// In-memory storage for conversations
const conversationStore: Map<string, any[]> = new Map();

const router = Router();

// Helper to safely get userId from params
function getUserId(req: Request): string | null {
  const userId = req.params.userId;
  if (!userId) return null;
  if (Array.isArray(userId)) return userId[0];
  return userId;
}

// Get user's conversation history
router.get('/history/:userId', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Invalid userId' });
    }
    
    const userConversations = conversationStore.get(userId) || [];
    const history = userConversations.slice(-10);
    
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
});

// Get previous symptoms for context
router.get('/previous-symptoms/:userId', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Invalid userId' });
    }
    
    const userConversations = conversationStore.get(userId) || [];
    const allSymptoms: string[] = [];
    
    const symptomKeywords = [
      'headache', 'fever', 'pain', 'cough', 'fatigue', 'nausea',
      'dizziness', 'shortness of breath', 'chest pain', 'sore throat',
      'vomiting', 'diarrhea', 'rash', 'swelling', 'weakness'
    ];
    
    const recentSessions = userConversations.slice(-3);
    
    for (const session of recentSessions) {
      if (session.keySymptoms && Array.isArray(session.keySymptoms)) {
        for (const symptom of session.keySymptoms) {
          if (!allSymptoms.includes(symptom)) {
            allSymptoms.push(symptom);
          }
        }
      }
      if (session.messages && Array.isArray(session.messages)) {
        for (const msg of session.messages) {
          if (msg.role === 'user' && msg.content && typeof msg.content === 'string') {
            const lowerContent = msg.content.toLowerCase();
            for (const keyword of symptomKeywords) {
              if (lowerContent.includes(keyword) && !allSymptoms.includes(keyword)) {
                allSymptoms.push(keyword);
              }
            }
          }
        }
      }
    }
    
    res.json({ success: true, data: allSymptoms.slice(0, 5) });
  } catch (error) {
    console.error('Error fetching previous symptoms:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch symptoms' });
  }
});

// Save conversation session
router.post('/session', async (req: Request, res: Response) => {
  try {
    const session = req.body;
    const userId = session.userId;
    
    if (!session || !session.id || !userId) {
      return res.status(400).json({ success: false, error: 'Invalid session data. Missing id or userId' });
    }
    
    if (!conversationStore.has(userId)) {
      conversationStore.set(userId, []);
    }
    
    const userConversations = conversationStore.get(userId)!;
    userConversations.push(session);
    
    if (userConversations.length > 50) {
      userConversations.shift();
    }
    
    console.log(`💾 Saved conversation for user: ${userId}`);
    res.json({ success: true, message: 'Session saved', sessionId: session.id });
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).json({ success: false, error: 'Failed to save session' });
  }
});

// Generate context prompt for AI
router.post('/context', async (req: Request, res: Response) => {
  try {
    const { userId, symptoms } = req.body;
    
    if (!userId || !symptoms) {
      return res.status(400).json({ success: false, error: 'userId and symptoms are required' });
    }
    
    const userConversations = conversationStore.get(userId) || [];
    let contextPrompt = '';
    
    if (userConversations.length > 0) {
      const previousSymptoms: string[] = [];
      const recentSessions = userConversations.slice(-3);
      
      for (const session of recentSessions) {
        if (session.keySymptoms && Array.isArray(session.keySymptoms)) {
          for (const symptom of session.keySymptoms) {
            if (!previousSymptoms.includes(symptom)) {
              previousSymptoms.push(symptom);
            }
          }
        }
      }
      
      if (previousSymptoms.length > 0) {
        contextPrompt = `\n\n[CONTEXT FROM PREVIOUS CONSULTATIONS]\nPreviously, you reported: ${previousSymptoms.slice(0, 3).join(', ')}.\nPlease consider this history when responding. Current symptoms: ${symptoms}`;
      }
    }
    
    res.json({ success: true, data: { contextPrompt } });
  } catch (error) {
    console.error('Error generating context:', error);
    res.status(500).json({ success: false, error: 'Failed to generate context' });
  }
});

export default router;