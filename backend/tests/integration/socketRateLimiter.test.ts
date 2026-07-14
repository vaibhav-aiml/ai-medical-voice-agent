import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupVoiceSocket } from '../../src/sockets/voiceSocket';
import { socketRateLimiter } from '../../src/utils/socketRateLimiter';
import { db } from '../../src/config/database';

vi.mock('../../src/config/database', () => ({
  db: {
    select: vi.fn()
  }
}));

describe('Socket.IO Rate Limiting Integration Tests', () => {
  let ioMock: any;
  let socketMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    ioMock = {
      use: vi.fn(),
      on: vi.fn()
    };

    socketMock = {
      id: 'mock-socket-id',
      data: { userId: 'clerk-user-123' },
      emit: vi.fn(),
      join: vi.fn()
    };
  });

  it('should allow events under rate limits and block once exceeded', async () => {
    socketRateLimiter.setLimit('join-consultation', 2);

    setupVoiceSocket(ioMock);

    const onConnection = ioMock.on.mock.calls[0][1];
    
    const registeredListeners: any = {};
    socketMock.on = vi.fn((event, cb) => {
      registeredListeners[event] = cb;
    });

    onConnection(socketMock);

    const mockUserSelect = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: 'db-user-uuid-999' }])
        })
      })
    };
    
    vi.mocked(db.select).mockReturnValue(mockUserSelect as any);

    // 1st request -> Allow
    let allowed1 = socketRateLimiter.consume('clerk-user-123', 'mock-socket-id', 'join-consultation');
    expect(allowed1).toBe(true);

    // 2nd request -> Allow
    let allowed2 = socketRateLimiter.consume('clerk-user-123', 'mock-socket-id', 'join-consultation');
    expect(allowed2).toBe(true);

    // 3rd request -> Block
    let allowed3 = socketRateLimiter.consume('clerk-user-123', 'mock-socket-id', 'join-consultation');
    expect(allowed3).toBe(false);
  });
});
