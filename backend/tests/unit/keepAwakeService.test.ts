import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { startKeepAwake, stopKeepAwake } from '../../src/services/keepAwakeService';

vi.mock('axios');
vi.mock('../../src/utils/logger');

describe('Keep-Awake Service Tests', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    stopKeepAwake();
    vi.useRealTimers();
    process.env = { ...originalEnv };
  });

  it('should not start the pinger if not in production and FORCE_KEEP_AWAKE is not true', () => {
    process.env.NODE_ENV = 'development';
    process.env.FORCE_KEEP_AWAKE = 'false';

    startKeepAwake();

    vi.advanceTimersByTime(1000000);
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('should start the pinger and request target URL at interval when FORCE_KEEP_AWAKE is true', async () => {
    process.env.NODE_ENV = 'development';
    process.env.FORCE_KEEP_AWAKE = 'true';
    process.env.KEEP_AWAKE_URL = 'http://test-url/health';
    process.env.KEEP_AWAKE_INTERVAL = '1000'; // 1 second

    // Mock axios response
    (axios.get as any).mockResolvedValue({ status: 200 });

    startKeepAwake();

    expect(axios.get).not.toHaveBeenCalled();

    // Advance by 1 second
    await vi.advanceTimersByTimeAsync(1000);
    expect(axios.get).toHaveBeenCalledWith('http://test-url/health', expect.any(Object));
  });

  it('should stop pinging when stopKeepAwake is called', async () => {
    process.env.NODE_ENV = 'development';
    process.env.FORCE_KEEP_AWAKE = 'true';
    process.env.KEEP_AWAKE_URL = 'http://test-url/health';
    process.env.KEEP_AWAKE_INTERVAL = '1000';

    (axios.get as any).mockResolvedValue({ status: 200 });

    startKeepAwake();
    await vi.advanceTimersByTimeAsync(1000);
    expect(axios.get).toHaveBeenCalledTimes(1);

    stopKeepAwake();

    await vi.advanceTimersByTimeAsync(2000);
    expect(axios.get).toHaveBeenCalledTimes(1); // Should not increase
  });
});
