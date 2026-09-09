import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoiceSocket } from '../../src/hooks/useVoiceSocket';
import io from 'socket.io-client';

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue('test-mock-token')
  })
}));

vi.mock('../../src/services/backendStatus', () => ({
  default: {
    getState: () => 'awake',
    waitForAwake: vi.fn().mockResolvedValue(undefined)
  }
}));

vi.mock('socket.io-client');

describe('useVoiceSocket hook activity-based keep-alive', () => {
  let mockSocket: any;
  let eventListeners: Record<string, Function>;
  let anyListener: Function | null;

  beforeEach(() => {
    vi.useFakeTimers();
    eventListeners = {};
    anyListener = null;

    mockSocket = {
      id: 'mock-socket-id',
      connected: true,
      on: vi.fn((event, cb) => {
        eventListeners[event] = cb;
      }),
      onAny: vi.fn((cb) => {
        anyListener = cb;
      }),
      emit: vi.fn(),
      disconnect: vi.fn().mockReturnThis(),
      connect: vi.fn().mockReturnThis(),
      io: {
        on: vi.fn()
      }
    };

    vi.mocked(io).mockReturnValue(mockSocket as any);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should not disconnect when receiving stream chunks (activity-based keep-alive)', async () => {
    const { result } = renderHook(() => useVoiceSocket('consultation-123'));

    await act(async () => {
      // Simulate socket connection
      eventListeners['connect']?.();
    });

    expect(result.current.connectionStatus).toBe('Connected');

    // Advance 30 seconds -> ping emitted, but incoming server packet arrives via onAny
    act(() => {
      vi.advanceTimersByTime(30000);
      anyListener?.('ai-response-chunk', { chunk: 'Hello' });
    });

    // Advance another 30 seconds (60s total) -> incoming packet arrives
    act(() => {
      vi.advanceTimersByTime(30000);
      anyListener?.('ai-response-chunk', { chunk: 'How are you' });
    });

    // Advance another 35 seconds (95s total) -> incoming packet arrives
    act(() => {
      vi.advanceTimersByTime(35000);
      anyListener?.('ai-response-chunk', { chunk: 'Stay hydrated' });
    });

    // Client should STILL be 'Connected', never triggering false 'Reconnecting (Heartbeat lost)...'
    expect(result.current.connectionStatus).toBe('Connected');
    expect(mockSocket.disconnect).not.toHaveBeenCalled();
  });

  it('should reset missed heartbeats and retain Connected on pong-heartbeat', async () => {
    const { result } = renderHook(() => useVoiceSocket('consultation-123'));

    await act(async () => {
      eventListeners['connect']?.();
    });

    expect(result.current.connectionStatus).toBe('Connected');

    act(() => {
      vi.advanceTimersByTime(30000);
      eventListeners['pong-heartbeat']?.();
    });

    expect(result.current.connectionStatus).toBe('Connected');
  });
});
