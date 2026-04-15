import { Router } from 'express';
import { db } from '../config/database';
import { consultations } from '../db/schema/index';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Save consultation to database
router.post('/save', async (req, res) => {
  try {
    console.log('📝 Received save request:', req.body);
    
    const { id, userId, specialistType, specialistName, status, symptoms, notes, duration, startedAt, endedAt } = req.body;
    
    // Validate required fields
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const consultation = await db.insert(consultations).values({
      id: id || uuidv4(),
      userId: userId,
      specialistType: specialistType || 'general',
      specialistName: specialistName || null,
      status: status || 'completed',
      symptoms: symptoms || '',
      notes: notes || '',
      duration: duration ? duration.toString() : '0',
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      endedAt: endedAt ? new Date(endedAt) : null,
    }).returning();
    
    console.log('✅ Consultation saved:', consultation[0]);
    res.json({ success: true, consultation: consultation[0] });
  } catch (error) {
    console.error('❌ Error saving consultation:', error);
    res.status(500).json({ error: 'Failed to save consultation', details: error.message });
  }
});

// Get user's consultations
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`📋 Fetching consultations for user: ${userId}`);
    
    const userConsultations = await db.select()
      .from(consultations)
      .where(eq(consultations.userId, userId))
      .orderBy(consultations.createdAt);
    
    console.log(`✅ Found ${userConsultations.length} consultations`);
    res.json(userConsultations);
  } catch (error) {
    console.error('❌ Error fetching consultations:', error);
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

// Get single consultation
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await db.select()
      .from(consultations)
      .where(eq(consultations.id, id));
    
    if (!consultation.length) {
      return res.status(404).json({ error: 'Consultation not found' });
    }
    
    res.json(consultation[0]);
  } catch (error) {
    console.error('Error fetching consultation:', error);
    res.status(500).json({ error: 'Failed to fetch consultation' });
  }
});

// Delete consultation
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(consultations).where(eq(consultations.id, id));
    res.json({ success: true, message: 'Consultation deleted' });
  } catch (error) {
    console.error('Error deleting consultation:', error);
    res.status(500).json({ error: 'Failed to delete consultation' });
  }
});

export default router;