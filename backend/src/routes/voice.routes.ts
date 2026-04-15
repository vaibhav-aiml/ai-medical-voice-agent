import { Router } from 'express';

const router = Router();

// Process voice (placeholder - actual processing is done via WebSocket)
router.post('/process', async (req, res) => {
  try {
    const { audioBuffer, consultationId } = req.body;
    res.json({ success: true, message: 'Audio received' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process voice' });
  }
});

export default router;