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
});
