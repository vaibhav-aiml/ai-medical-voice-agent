import { describe, it, expect, vi, beforeEach } from 'vitest';
import offlineQueue from '../../src/services/offlineQueue';
import cacheService from '../../src/services/cacheService';
import apiClient from '../../src/services/apiClient';

describe('offlineQueue Service Tests', () => {
  beforeEach(() => {
    offlineQueue.clear();
    vi.restoreAllMocks();
  });

  it('should enqueue and retrieve items', () => {
    offlineQueue.enqueue({
      method: 'POST',
      url: '/consultations/save',
      data: { id: 'c1', symptoms: 'headache' },
    });

    expect(offlineQueue.size()).toBe(1);
    const items = offlineQueue.getItems();
    expect(items[0].url).toBe('/consultations/save');
    expect(items[0].retries).toBe(0);
  });

  it('should replay successfully using apiClient and evict completed items', async () => {
    offlineQueue.enqueue({
      method: 'POST',
      url: '/consultations/save',
      data: { id: 'c2' },
    });

    const requestSpy = vi.spyOn(apiClient.getInstance(), 'request').mockResolvedValueOnce({
      status: 200,
      data: { success: true },
    } as any);

    await offlineQueue.replay();

    expect(requestSpy).toHaveBeenCalledTimes(1);
    expect(offlineQueue.size()).toBe(0);
  });

  it('should pause replay and retain items when encountering 401 Unauthorized', async () => {
    offlineQueue.enqueue({
      method: 'POST',
      url: '/consultations/save',
      data: { id: 'c_auth_fail' },
    });

    vi.spyOn(apiClient.getInstance(), 'request').mockRejectedValueOnce({
      response: { status: 401, data: { error: 'Unauthorized' } },
      message: 'Request failed with status code 401',
    });

    await offlineQueue.replay();

    // Item must NOT be evicted on 401 — it must be preserved until token is refreshed
    expect(offlineQueue.size()).toBe(1);
    const items = offlineQueue.getItems();
    expect(items[0].id).toBeDefined();
  });

  it('should immediately evict 400 Bad Request as a poison pill', async () => {
    offlineQueue.enqueue({
      method: 'POST',
      url: '/consultations/save',
      data: { id: 'c_bad_request' },
    });

    vi.spyOn(apiClient.getInstance(), 'request').mockRejectedValueOnce({
      response: { status: 400, data: { error: 'Malformed Payload' } },
      message: 'Request failed with status code 400',
    });

    await offlineQueue.replay();

    // Poison pill must be evicted immediately
    expect(offlineQueue.size()).toBe(0);
  });
});
