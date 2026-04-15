import { Router } from 'express';
import { db } from '../config/database';
import { consultations, medicalReports } from '../db/schema/index';

const router = Router();

// Start new consultation
router.post('/start', async (req, res) => {
  try {
    const { userId, specialistType, symptoms, notes } = req.body;
    
    const consultation = await db.insert(consultations).values({
      userId: userId || 'test-user-123',
      specialistType,
      symptoms: symptoms || '',
      notes: notes || '',
      status: 'active',
      startedAt: new Date(),
    }).returning();
    
    res.json({ success: true, consultation: consultation[0] });
  } catch (error) {
    console.error('Error starting consultation:', error);
    res.status(500).json({ error: 'Failed to start consultation' });
  }
});

// Get consultation by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await db.select().from(consultations).where({ id });
    
    if (!consultation.length) {
      return res.status(404).json({ error: 'Consultation not found' });
    }
    
    res.json(consultation[0]);
  } catch (error) {
    console.error('Error fetching consultation:', error);
    res.status(500).json({ error: 'Failed to fetch consultation' });
  }
});

// End consultation
router.post('/:id/end', async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.update(consultations)
      .set({ status: 'completed', endedAt: new Date() })
      .where({ id });
    
    res.json({ success: true, message: 'Consultation ended successfully' });
  } catch (error) {
    console.error('Error ending consultation:', error);
    res.status(500).json({ error: 'Failed to end consultation' });
  }
});

// Get user's consultation history
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userConsultations = await db.select()
      .from(consultations)
      .where({ userId })
      .orderBy({ createdAt: 'desc' });
    
    res.json(userConsultations);
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

export default router;