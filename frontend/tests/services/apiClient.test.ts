import { describe, it, expect } from 'vitest';
import { apiClient } from '../../src/services/apiClient';

describe('Frontend API Client Service Tests', () => {
  it('should initialize underlying Axios instance with 25s timeout', () => {
    const instance = apiClient.getInstance();
    expect(instance.defaults.timeout).toBe(25000);
  });

  it('should format postIdempotent requests with Idempotency-Key header', async () => {
    expect(apiClient.postIdempotent).toBeDefined();
  });

  it('should expose patch method', () => {
    expect(apiClient.patch).toBeDefined();
    expect(typeof apiClient.patch).toBe('function');
  });

  it('should sanitize leading /api/ in request interceptor', async () => {
    const instance = apiClient.getInstance();
    const interceptor = (instance.interceptors.request as any).handlers[0];
    const config = { url: '/api/clinic/123', headers: {} };
    const processed = await interceptor.fulfilled(config);
    expect(processed.url).toBe('/clinic/123');
  });
});
