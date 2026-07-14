import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import reminderRouter from '../../src/routes/reminder.routes';
import { reminderService } from '../../src/services/reminderService';
import { errorHandler } from '../../src/middleware/errorHandler';

vi.mock('../../src/services/reminderService', () => ({
  reminderService: {
    addMedication: vi.fn(),
    getUserMedications: vi.fn(),
    getMedicationById: vi.fn(),
    updateMedication: vi.fn(),
    deleteMedication: vi.fn(),
    getUserPreferences: vi.fn(),
    setUserPreferences: vi.fn(),
    acknowledgeReminder: vi.fn(),
    getReminderStats: vi.fn()
  }
}));

vi.mock('../../src/middleware/auth', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.userId = 'dev-user-123';
    next();
  }
}));

describe('Reminder Routes IDOR Protection Tests', () => {
  let app: express.Express;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/reminder', reminderRouter);
    app.use(errorHandler);
  });

  describe('GET /api/reminder/medications/:userId', () => {
    it('should permit access if userId matches logged-in user', async () => {
      vi.mocked(reminderService.getUserMedications).mockReturnValueOnce([]);
      
      await request(app)
        .get('/api/reminder/medications/dev-user-123')
        .expect(200);

      expect(reminderService.getUserMedications).toHaveBeenCalledWith('dev-user-123');
    });

    it('should deny access (403) if userId does not match logged-in user', async () => {
      await request(app)
        .get('/api/reminder/medications/another-user-456')
        .expect(403);
    });
  });

  describe('PUT /api/reminder/medication/:id', () => {
    it('should permit update if medication belongs to the authenticated user', async () => {
      const mockMed = { id: 'med-1', userId: 'dev-user-123', name: 'Aspirin' };
      vi.mocked(reminderService.getMedicationById).mockReturnValueOnce(mockMed as any);
      vi.mocked(reminderService.updateMedication).mockReturnValueOnce(mockMed as any);

      await request(app)
        .put('/api/reminder/medication/med-1')
        .send({ name: 'Aspirin' })
        .expect(200);

      expect(reminderService.updateMedication).toHaveBeenCalledWith('med-1', { name: 'Aspirin' });
    });

    it('should deny update (403) if medication belongs to another user', async () => {
      const mockMed = { id: 'med-1', userId: 'another-user-456', name: 'Aspirin' };
      vi.mocked(reminderService.getMedicationById).mockReturnValueOnce(mockMed as any);

      await request(app)
        .put('/api/reminder/medication/med-1')
        .send({ name: 'Aspirin' })
        .expect(403);
    });
  });
});
