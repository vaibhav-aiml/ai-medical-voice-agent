import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

/**
 * Sets up global request interceptors for Clerk auth tokens on both
 * axios and the native fetch API. Call once from a top-level component.
 */
export function useAuthInterceptor() {
  const { getToken } = useAuth();

  useEffect(() => {
    // 1. Axios request interceptor
    const axiosInterceptor = axios.interceptors.request.use(async (config) => {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error('Failed to attach token to Axios request', err);
      }
      return config;
    });

    // 2. Global fetch interceptor
    const originalFetch = window.fetch;
    window.fetch = async function (input, init) {
      try {
        const token = await getToken();
        if (token) {
          init = init || {};
          init.headers = {
            ...init.headers,
            'Authorization': `Bearer ${token}`,
          };
        }
      } catch (err) {
        console.error('Failed to attach token to fetch request', err);
      }
      return originalFetch(input, init);
    };

    return () => {
      axios.interceptors.request.eject(axiosInterceptor);
      window.fetch = originalFetch;
    };
  }, [getToken]);
}
