import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';

describe('WebSocket & Socket.IO Integration Tests', () => {
  let io: Server;
  let serverSocket: any;
  let clientSocket: ClientSocket;
  let port: number;

  beforeAll(() => {
    return new Promise((resolve) => {
      const httpServer = createServer();
      io = new Server(httpServer);
      httpServer.listen(() => {
        const address = httpServer.address();
        port = typeof address === 'object' && address ? address.port : 3000;
        
        io.on('connection', (socket) => {
          serverSocket = socket;
          socket.on('ping-heartbeat', () => {
            socket.emit('pong-heartbeat', { status: 'alive', timestamp: Date.now() });
          });
        });

        clientSocket = ioc(`http://localhost:${port}`);
        clientSocket.on('connect', resolve);
      });
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  it('should establish Socket.IO connection', () => {
    expect(clientSocket.connected).toBe(true);
  });

  it('should handle ping/pong heartbeat roundtrip', () => {
    return new Promise((resolve) => {
      clientSocket.emit('ping-heartbeat');
      clientSocket.on('pong-heartbeat', (data) => {
        expect(data.status).toBe('alive');
        expect(data.timestamp).toBeDefined();
        resolve(true);
      });
    });
  });
});
