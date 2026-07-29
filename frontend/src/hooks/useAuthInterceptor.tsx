import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { apiClient } from '../services/apiClient';

/**
 * Sets up auth token injection on the shared apiClient instance.
 * Call once from a top-level component (AppContent).
 *
 * Attaches a request interceptor that adds the Clerk Bearer token to
 * every outgoing request via apiClient's axios instance.
 */
export function useAuthInterceptor() {
  const { getToken } = useAuth();

  useEffect(() => {
    const instance = apiClient.getInstance();

    const interceptorId = instance.interceptors.request.use(async (config) => {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error('Failed to attach Clerk token to request', err);
      }
      return config;
    });

    return () => {
      instance.interceptors.request.eject(interceptorId);
    };
  }, [getToken]);
}
