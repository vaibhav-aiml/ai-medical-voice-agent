import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { BACKEND_URL } from '../config/api';
import logger from './logger';
import backendStatus from './backendStatus';
const DEFAULT_TIMEOUT = 25_000; 
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;
const MAX_DELAY_MS = 16_000;
const inflightRequests = new Map<string, Promise<AxiosResponse>>();

function dedupKey(config: InternalAxiosRequestConfig): string | null {
  if (config.method?.toUpperCase() !== 'GET') return null;
  return `GET:${config.url}`;
}
function jitteredDelay(attempt: number): number {
  const exponential = Math.min(BASE_DELAY_MS * Math.pow(2, attempt), MAX_DELAY_MS);
  const jitter = Math.random() * BASE_DELAY_MS;
  return exponential + jitter;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function isRetryableMethod(config: InternalAxiosRequestConfig): boolean {
  const method = config.method?.toUpperCase() ?? '';
  
  if (method === 'GET') return true;
  
  if (method === 'POST' && config.headers?.['Idempotency-Key']) return true;
  return false;
}

function isRetryableError(error: AxiosError): boolean {
  
  if (!error.response) return true;
  
  if (error.response.status >= 500) return true;
  
  if (error.code === 'ECONNABORTED') return true;
  return false;
}
const instance: AxiosInstance = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});
instance.interceptors.request.use(
  (config) => {
    
    const requestId = logger.generateRequestId();
    config.headers['X-Request-ID'] = requestId;
    
    (config as any)._requestId = requestId;
    (config as any)._startTime = Date.now();
    (config as any)._retryCount = (config as any)._retryCount ?? 0;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      logger.warn('request_offline', {
        requestId,
        method: config.method,
        url: config.url,
      });
      return Promise.reject(
        new axios.Cancel('Device is offline')
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);
instance.interceptors.response.use(
  (response) => {
    const config = response.config as any;
    const duration = Date.now() - (config._startTime ?? Date.now());
    logger.info('request_completed', {
      requestId: config._requestId,
      method: config.method?.toUpperCase(),
      url: config.url,
      status: response.status,
      duration_ms: duration,
      retries: config._retryCount ?? 0,
    });
    logger.metric('api_request_count');
    logger.metric('api_total_latency_ms', duration);
    backendStatus.reportSuccess();
    const key = dedupKey(response.config);
    if (key) inflightRequests.delete(key);

    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as any;
    if (!config) return Promise.reject(error);

    const retryCount: number = config._retryCount ?? 0;
    const duration = Date.now() - (config._startTime ?? Date.now());
    const key = dedupKey(config);
    if (key) inflightRequests.delete(key);
    logger.warn('request_failed', {
      requestId: config._requestId,
      method: config.method?.toUpperCase(),
      url: config.url,
      status: error.response?.status ?? 'network_error',
      duration_ms: duration,
      retries: retryCount,
      error: error.message,
    });
    const isTimeout = error.code === 'ECONNABORTED' || !error.response;
    if (isTimeout && backendStatus.getState() !== 'awake') {
      backendStatus.reportTimeout();
    }
    if (
      isRetryableMethod(config) &&
      isRetryableError(error) &&
      retryCount < MAX_RETRIES
    ) {
      config._retryCount = retryCount + 1;
      const delay = jitteredDelay(retryCount);

      logger.info('request_retrying', {
        requestId: config._requestId,
        method: config.method?.toUpperCase(),
        url: config.url,
        attempt: config._retryCount,
        backoff_ms: Math.round(delay),
      });
      logger.metric('retry_count');
      if (backendStatus.getState() === 'waking') {
        try {
          await backendStatus.waitForAwake();
        } catch {
          
        }
      }

      await sleep(delay);
      config._startTime = Date.now();

      try {
        const result = await instance.request(config);
        logger.metric('retry_success_count');
        return result;
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }
    logger.metric('api_request_count');
    logger.metric('api_total_latency_ms', duration);

    return Promise.reject(error);
  }
);
export const apiClient = {
  async get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    const fullConfig = { ...config, method: 'GET', url };
    const key = `GET:${url}`;
    const existing = inflightRequests.get(key);
    if (existing) {
      logger.info('request_deduplicated', { url, consumers: 'shared' });
      return existing as Promise<AxiosResponse<T>>;
    }

    const promise = instance.get<T>(url, config);
    inflightRequests.set(key, promise as Promise<AxiosResponse>);
    promise.catch(() => inflightRequests.delete(key));

    return promise;
  },
  async post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return instance.post<T>(url, data, config);
  },
  async postIdempotent<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    const idempotencyKey = logger.generateRequestId();
    return instance.post<T>(url, data, {
      ...config,
      headers: {
        ...config?.headers,
        'Idempotency-Key': idempotencyKey,
      },
    });
  },
  async put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return instance.put<T>(url, data, config);
  },
  async delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return instance.delete<T>(url, config);
  },
  getInstance(): AxiosInstance {
    return instance;
  },
};

export default apiClient;