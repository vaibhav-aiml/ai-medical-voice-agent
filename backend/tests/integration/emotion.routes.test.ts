import { describe, it, expect, vi } from 'vitest';
import router from '../../src/routes/voice.routes';
import { Request, Response } from 'express';

// Mock DB configurations
vi.mock('../../src/config/database', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([
          {
            id: 'session-123',
            consultationId: 'consultation-123',
            emotion: 'neutral',
            emotionConfidence: '0.9',
            emotionScores: {},
          }
        ]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ id: 'session-123' }]),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue([{ id: 'session-123' }]),
    }),
  },
}));

describe('Voice Emotion Routes Integration Tests', () => {
  it('POST /detect-emotion should return success and emotion payload', async () => {
    let responseData: any = null;
    let responseStatus: number = 200;

    const req = {
      body: {
        text: 'I am so happy and excited today!',
        consultationId: 'd3b07384-d113-4ec3-a558-7c3078972b22', // Valid UUID
      },
    } as unknown as Request;

    // Retrieve route handler matching POST /detect-emotion
    const route = router.stack.find(
      (layer: any) => layer.route && layer.route.path === '/detect-emotion' && layer.route.methods.post
    );

    expect(route).toBeDefined();

    const handler = route.route.stack[route.route.stack.length - 1].handle;

    const responsePromise = new Promise<void>((resolve) => {
      const res = {
        status: (code: number) => {
          responseStatus = code;
          return res;
        },
        json: (data: any) => {
          responseData = data;
          resolve();
          return res;
        },
      } as unknown as Response;

      handler(req, res, (err) => {
        if (err) resolve();
      });
    });

    await responsePromise;

    expect(responseStatus).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.data.emotion).toBeDefined();
    expect(responseData.data.confidence).toBeDefined();
  });

  it('GET /emotions/:consultationId should return stored emotions', async () => {
    let responseData: any = null;
    let responseStatus: number = 200;

    const req = {
      params: {
        consultationId: 'd3b07384-d113-4ec3-a558-7c3078972b22',
      },
    } as unknown as Request;

    const route = router.stack.find(
      (layer: any) => layer.route && layer.route.path === '/emotions/:consultationId' && layer.route.methods.get
    );

    expect(route).toBeDefined();

    const handler = route.route.stack[route.route.stack.length - 1].handle;

    const responsePromise = new Promise<void>((resolve) => {
      const res = {
        status: (code: number) => {
          responseStatus = code;
          return res;
        },
        json: (data: any) => {
          responseData = data;
          resolve();
          return res;
        },
      } as unknown as Response;

      handler(req, res, (err) => {
        if (err) resolve();
      });
    });

    await responsePromise;

    expect(responseStatus).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.data).toBeInstanceOf(Array);
    expect(responseData.data[0].emotion).toBe('neutral');
  });
});
