import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupVoiceSocket } from '../../src/sockets/voiceSocket';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { db } from '../../src/config/database';

vi.mock('@clerk/clerk-sdk-node', () => ({
  clerkClient: {
    verifyToken: vi.fn()
  }
}));

vi.mock('../../src/config/database', () => ({
  db: {
    select: vi.fn()
  }
}));

describe('Socket.IO Authentication & Authorization Integration Tests', () => {
  let ioMock: any;
  let socketMock: any;
  let handshakeMiddleware: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    ioMock = {
      use: vi.fn((fn) => {
        handshakeMiddleware = fn;
      }),
      on: vi.fn()
    };

    socketMock = {
      id: 'mock-socket-id',
      handshake: {
        auth: { token: 'mock-token' },
        headers: {}
      },
      data: {},
      join: vi.fn(),
      emit: vi.fn()
    };
  });

  it('should verify handshake middleware successfully signs in user', async () => {
    setupVoiceSocket(ioMock);
    expect(ioMock.use).toHaveBeenCalled();

    vi.mocked(clerkClient.verifyToken).mockResolvedValueOnce({ sub: 'user-789' } as any);

    const nextFn = vi.fn();
    await handshakeMiddleware(socketMock, nextFn);

    expect(nextFn).toHaveBeenCalledWith();
    expect(socketMock.data.userId).toBe('user-789');
  });

  it('should reject connection when token validation fails (fail-closed, no dev-user-123 fallback)', async () => {
    process.env.NODE_ENV = 'development';
    setupVoiceSocket(ioMock);

    vi.mocked(clerkClient.verifyToken).mockRejectedValueOnce(new Error('Token expired'));

    const nextFn = vi.fn();
    await handshakeMiddleware(socketMock, nextFn);

    // Verify fail-closed: next() is called with an Error, NOT called with no args
    expect(nextFn).toHaveBeenCalledWith(expect.any(Error));
    expect(nextFn.mock.calls[0][0].message).toContain('Token verification failed');
    // userId should NOT be set to dev-user-123
    expect(socketMock.data.userId).not.toBe('dev-user-123');
  });

  it('should reject join-consultation if user does not own consultation', async () => {
    setupVoiceSocket(ioMock);
    
    const onConnection = ioMock.on.mock.calls[0][1];
    socketMock.data.userId = 'clerk-user-123';
    
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
    
    const mockConsultationSelect = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: 'consult-id-777', userId: 'another-user-uuid' }])
        })
      })
    };
    
    vi.mocked(db.select)
      .mockReturnValueOnce(mockUserSelect as any)
      .mockReturnValueOnce(mockConsultationSelect as any);

    const joinConsultationCb = registeredListeners['join-consultation'];
    await joinConsultationCb('consult-id-777');

    expect(socketMock.join).not.toHaveBeenCalled();
    expect(socketMock.emit).toHaveBeenCalledWith('error-event', { message: 'Unauthorized: Access denied' });
  });

  it('should permit join-consultation if user owns the consultation', async () => {
    setupVoiceSocket(ioMock);
    
    const onConnection = ioMock.on.mock.calls[0][1];
    socketMock.data.userId = 'clerk-user-123';
    
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
    
    const mockConsultationSelect = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: 'consult-id-777', userId: 'db-user-uuid-999' }])
        })
      })
    };
    
    vi.mocked(db.select)
      .mockReturnValueOnce(mockUserSelect as any)
      .mockReturnValueOnce(mockConsultationSelect as any);

    const joinConsultationCb = registeredListeners['join-consultation'];
    await joinConsultationCb('consult-id-777');

    expect(socketMock.join).toHaveBeenCalledWith('consultation_consult-id-777');
    expect(socketMock.emit).not.toHaveBeenCalledWith('error-event', expect.any(Object));
  });

  it('should respond to ping-heartbeat with pong-heartbeat payload', () => {
    let onConnection: any;
    ioMock.on = vi.fn((event, cb) => {
      if (event === 'connection') onConnection = cb;
    });

    setupVoiceSocket(ioMock);

    const registeredListeners: any = {};
    socketMock.on = vi.fn((event, cb) => {
      registeredListeners[event] = cb;
    });

    onConnection(socketMock);

    expect(registeredListeners['ping-heartbeat']).toBeDefined();
    const pingHeartbeatCb = registeredListeners['ping-heartbeat'];
    const clientTimestamp = 1710000000000;
    pingHeartbeatCb({ timestamp: clientTimestamp });

    expect(socketMock.emit).toHaveBeenCalledWith(
      'pong-heartbeat',
      expect.objectContaining({
        timestamp: expect.any(Number),
        clientTimestamp,
      })
    );
  });
});
