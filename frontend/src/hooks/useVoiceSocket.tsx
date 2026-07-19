import { useEffect, useState, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from '@clerk/clerk-react';
import { BACKEND_URL } from '../config/api';

export function useVoiceSocket(consultationId: string) {
  const { getToken } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [socket, setSocket] = useState<Socket | null>(null);

  // Stable ref that always points to the current socket instance.
  // Use socketRef.current inside callbacks to avoid stale closures.
  const socketRef = useRef<Socket | null>(null);

  // Keep socketRef in sync with state
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  // Store getToken in a ref to avoid reconnecting Socket.IO client when Clerk token updates or hook reference changes
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  useEffect(() => {
    if (!consultationId) return;

    console.log('🔌 [useVoiceSocket] Connecting to WebSocket at:', BACKEND_URL, 'for consultation:', consultationId);

    const socketInstance = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
      auth: (cb) => {
        getTokenRef.current()
          .then((token) => cb({ token }))
          .catch((err) => {
            console.error('Failed to get Clerk token for Socket.IO:', err);
            cb({ token: null });
          });
      }
    });

    setSocket(socketInstance);
    socketRef.current = socketInstance; // Also set ref immediately (don't wait for state batching)

    socketInstance.on('connect', () => {
      console.log('✅ [useVoiceSocket] WebSocket connected! Socket ID:', socketInstance.id);
      setConnectionStatus('Connected');
      socketInstance.emit('join-consultation', consultationId);
    });

    socketInstance.on('disconnect', (reason) => {
      console.warn('🔌 [useVoiceSocket] WebSocket disconnected:', reason);
      setConnectionStatus(`Disconnected (${reason})`);
    });

    socketInstance.on('reconnect', (attemptNumber: number) => {
      console.log('🔄 [useVoiceSocket] WebSocket reconnected after', attemptNumber, 'attempts');
      setConnectionStatus('Connected');
    });

    socketInstance.on('connect_error', (error: any) => {
      console.error('❌ [useVoiceSocket] WebSocket connection error:', error.message || error);
      if (error.message && (error.message.includes('Authentication') || error.message.includes('Token') || error.message.includes('auth'))) {
        setConnectionStatus('Authentication Failed');
      } else {
        setConnectionStatus('Connection failed');
      }
    });

    return () => {
      console.log('🔌 [useVoiceSocket] Disconnecting WebSocket for consultation:', consultationId);
      socketInstance.disconnect();
      setSocket(null);
      socketRef.current = null;
    };
  }, [consultationId]);

  /**
   * Send a message through the socket using the stable ref.
   * Returns true if the message was emitted, false if the socket is not connected.
   */
  const sendMessage = useCallback((event: string, data: any): boolean => {
    const currentSocket = socketRef.current;
    if (currentSocket && currentSocket.connected) {
      console.log(`📤 [useVoiceSocket] Emitting "${event}" via socket ${currentSocket.id}`);
      currentSocket.emit(event, data);
      return true;
    }
    console.error(`❌ [useVoiceSocket] Cannot emit "${event}" — socket not connected. Socket:`, currentSocket, 'Connected:', currentSocket?.connected);
    return false;
  }, []);

  return {
    socket,
    socketRef,
    connectionStatus,
    sendMessage,
  };
}
