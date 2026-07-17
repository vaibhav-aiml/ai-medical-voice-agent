import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from '@clerk/clerk-react';
import { BACKEND_URL } from '../config/api';

export function useVoiceSocket(consultationId: string) {
  const { getToken } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!consultationId) return;

    console.log('🔌 Connecting to WebSocket at:', BACKEND_URL);

    const socketInstance = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
      auth: (cb) => {
        getToken()
          .then((token) => cb({ token }))
          .catch((err) => {
            console.error('Failed to get Clerk token for Socket.IO:', err);
            cb({ token: null });
          });
      }
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('✅ WebSocket connected successfully!');
      setConnectionStatus('Connected');
      socketInstance.emit('join-consultation', consultationId);
    });

    socketInstance.on('connect_error', (error: any) => {
      console.error('❌ WebSocket connection error:', error.message || error);
      if (error.message && (error.message.includes('Authentication') || error.message.includes('Token') || error.message.includes('auth'))) {
        setConnectionStatus('Authentication Failed');
      } else {
        setConnectionStatus('Connection failed');
      }
    });

    return () => {
      console.log('🔌 Disconnecting WebSocket');
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [consultationId, getToken]);

  return {
    socket,
    connectionStatus,
  };
}
