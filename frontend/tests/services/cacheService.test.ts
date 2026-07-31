import { describe, it, expect, beforeEach } from 'vitest';
import { cacheService } from '../../src/services/cacheService';

describe('Cache Service Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should store and retrieve cached item before TTL expires', () => {
    cacheService.set('testKey', { data: 'hello' }, 5000);
    const retrieved = cacheService.get<{ data: string }>('testKey');
    expect(retrieved?.data).toBe('hello');
  });

  it('should clear cached item when deleted', () => {
    cacheService.set('shortKey', 'value', 5000);
    cacheService.remove('shortKey');
    const value = cacheService.get('shortKey');
    expect(value).toBeNull();
  });
});
