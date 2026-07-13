import { describe, it, expect, vi } from 'vitest';
import router from '../../src/routes/voice.routes';
import { Request, Response } from 'express';
import * as biometricsService from '../../src/services/biometricsService';

describe('Voice Biometrics Routes Integration Tests', () => {
  it('POST /biometrics/enroll should successfully enroll user voice base64 buffer', async () => {
    // Mock the enrollment service to prevent real database execution during simple routing checks
    const enrollSpy = vi.spyOn(biometricsService, 'enrollVoiceTemplate').mockResolvedValue({
      success: true,
      message: 'Voice profile enrolled successfully.',
    });

    const mockUserId = 'd3b07384-d113-4ec3-a558-7c3078972b22';
    const req = {
      body: {
        userId: mockUserId,
        audio: Buffer.from('mock-audio-data').toString('base64'),
      },
    } as unknown as Request;

    const route = router.stack.find(
      (layer: any) => layer.route && layer.route.path === '/biometrics/enroll' && layer.route.methods.post
    );

    expect(route).toBeDefined();

    const handler = route.route.stack[route.route.stack.length - 1].handle;

    let responseData: any = null;
    let responseStatus: number = 200;

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
    expect(enrollSpy).toHaveBeenCalled();

    enrollSpy.mockRestore();
  });

  it('POST /biometrics/verify should correctly return match status and confidence score', async () => {
    const verifySpy = vi.spyOn(biometricsService, 'verifyVoiceTemplate').mockResolvedValue({
      success: true,
      isMatch: true,
      confidence: 0.95,
      message: 'Voice signature verified successfully.',
    });

    const mockUserId = 'd3b07384-d113-4ec3-a558-7c3078972b22';
    const req = {
      body: {
        userId: mockUserId,
        audio: Buffer.from('mock-audio-data').toString('base64'),
      },
    } as unknown as Request;

    const route = router.stack.find(
      (layer: any) => layer.route && layer.route.path === '/biometrics/verify' && layer.route.methods.post
    );

    expect(route).toBeDefined();

    const handler = route.route.stack[route.route.stack.length - 1].handle;

    let responseData: any = null;
    let responseStatus: number = 200;

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
    expect(responseData.isMatch).toBe(true);
    expect(responseData.confidence).toBe(0.95);
    expect(verifySpy).toHaveBeenCalled();

    verifySpy.mockRestore();
  });
});
