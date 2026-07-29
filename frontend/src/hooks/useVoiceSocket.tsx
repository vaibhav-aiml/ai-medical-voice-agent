import { useEffect, useState, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from '@clerk/clerk-react';
import { BACKEND_URL } from '../config/api';
import backendStatus from '../services/backendStatus';
import logger from '../services/logger';

export function useVoiceSocket(consultationId: string) {
  const { getToken } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [failedPermanently, setFailedPermanently] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const missedHeartbeatsRef = useRef<number>(0);

  // Keep socketRef in sync with state
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  // Store getToken in a ref to avoid reconnecting Socket.IO client when Clerk token updates
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  useEffect(() => {
    if (!consultationId) return;

    let isMounted = true;
    let socketInstance: Socket | null = null;

    const initSocket = async () => {
      // If backend is currently waking from cold start, wait until it's awake first
      if (backendStatus.getState() === 'waking') {
        setConnectionStatus('Waiting for server...');
        logger.info('socket_waiting_for_backend', { consultationId });
        await backendStatus.waitForAwake();
      }

      if (!isMounted) return;

      const requestId = logger.generateRequestId();
      logger.info('socket_connecting', { consultationId, requestId, backendUrl: BACKEND_URL });

      socketInstance = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 16000,
        timeout: 10000,
        auth: (cb) => {
          getTokenRef.current()
            .then((token) => cb({ token, requestId }))
            .catch((err) => {
              logger.error('socket_token_failed', { error: err.message });
              cb({ token: null, requestId });
            });
        },
      });

      setSocket(socketInstance);
      socketRef.current = socketInstance;

      socketInstance.on('connect', () => {
        logger.info('socket_connected', { consultationId, socketId: socketInstance?.id });
        setConnectionStatus('Connected');
        setIsReconnecting(false);
        setFailedPermanently(false);
        missedHeartbeatsRef.current = 0;
        socketInstance?.emit('join-consultation', consultationId);

        // Start 30s heartbeat
        if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = setInterval(() => {
          const currentSock = socketRef.current;
          if (currentSock && currentSock.connected) {
            missedHeartbeatsRef.current++;
            if (missedHeartbeatsRef.current > 2) {
              logger.warn('socket_heartbeat_missed', { missed: missedHeartbeatsRef.current });
              setConnectionStatus('Reconnecting (Heartbeat lost)...');
              setIsReconnecting(true);
              currentSock.connect(); // Force reconnect
              missedHeartbeatsRef.current = 0;
            } else {
              currentSock.emit('ping-heartbeat', { timestamp: Date.now() });
            }
          }
        }, 30000);
      });

      socketInstance.on('pong-heartbeat', () => {
        missedHeartbeatsRef.current = 0;
      });

      socketInstance.on('disconnect', (reason) => {
        logger.warn('socket_disconnected', { consultationId, reason });
        setConnectionStatus(`Disconnected (${reason})`);
        if (reason === 'io server disconnect') {
          // Server disconnected us, manual reconnect needed
          socketInstance?.connect();
        }
      });

      socketInstance.io.on('reconnect_attempt', (attempt: number) => {
        logger.info('socket_reconnect_attempt', { consultationId, attempt });
        setIsReconnecting(true);
        setConnectionStatus(`Reconnecting (Attempt ${attempt}/5)...`);
        logger.metric('websocket_reconnect_count');
      });

      socketInstance.io.on('reconnect_failed', () => {
        logger.error('socket_reconnect_failed', { consultationId });
        setIsReconnecting(false);
        setFailedPermanently(true);
        setConnectionStatus('Connection Failed Permanently');
      });

      socketInstance.on('connect_error', (error: any) => {
        logger.error('socket_connect_error', { consultationId, error: error.message || error });
        if (error.message && (error.message.includes('Authentication') || error.message.includes('Token') || error.message.includes('auth'))) {
          setConnectionStatus('Authentication Failed');
        } else {
          setConnectionStatus('Connection failed');
        }
      });
    };

    initSocket();

    return () => {
      isMounted = false;
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
      if (socketInstance) {
        logger.info('socket_disconnecting', { consultationId });
        socketInstance.disconnect();
      }
      setSocket(null);
      socketRef.current = null;
    };
  }, [consultationId]);

  /**
   * Send a message through the socket using the stable ref.
   */
  const sendMessage = useCallback((event: string, data: any): boolean => {
    const currentSocket = socketRef.current;
    if (currentSocket && currentSocket.connected) {
      logger.info('socket_emit', { event, socketId: currentSocket.id });
      currentSocket.emit(event, data);
      return true;
    }
    logger.error('socket_emit_failed', { event, connected: currentSocket?.connected });
    return false;
  }, []);

  return {
    socket,
    socketRef,
    connectionStatus,
    isReconnecting,
    failedPermanently,
    sendMessage,
  };
}

export default useVoiceSocket;
