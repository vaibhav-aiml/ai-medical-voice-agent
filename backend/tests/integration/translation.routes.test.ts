import { describe, it, expect, vi } from 'vitest';
import router from '../../src/routes/voice.routes';
import { Request, Response } from 'express';

describe('Voice Translation Routes Integration Tests', () => {
  it('POST /translate should return success and translated text payload', async () => {
    let responseData: any = null;
    let responseStatus: number = 200;

    const req = {
      body: {
        text: 'Hello, how can I help you today?',
        targetLang: 'hi',
        sourceLang: 'en',
      },
    } as unknown as Request;

    // Retrieve route handler matching POST /translate
    const route = router.stack.find(
      (layer: any) => layer.route && layer.route.path === '/translate' && layer.route.methods.post
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
    expect(responseData.data.translatedText).toBeDefined();
    expect(responseData.data.targetLang).toBe('hi');
  });
});
