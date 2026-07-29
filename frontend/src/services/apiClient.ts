/**
 * Resilient Axios client.
 *
 * Central HTTP client for all frontend API calls. Handles:
 * - 25s timeout
 * - GET-only automatic retry with jittered exponential backoff
 * - Idempotent POST retry (with Idempotency-Key header)
 * - Request deduplication (in-flight map for GET)
 * - Circuit breaker integration (backendStatus)
 * - Correlation IDs (X-Request-ID on every request)
 * - Offline detection
 * - Structured logging and metrics
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { BACKEND_URL } from '../config/api';
import logger from './logger';
import backendStatus from './backendStatus';

// ---------- Constants ----------

const DEFAULT_TIMEOUT = 25_000; // 25 seconds
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;
const MAX_DELAY_MS = 16_000;

// ---------- In-flight deduplication map ----------

const inflightRequests = new Map<string, Promise<AxiosResponse>>();

function dedupKey(config: InternalAxiosRequestConfig): string | null {
  if (config.method?.toUpperCase() !== 'GET') return null;
  return `GET:${config.url}`;
}

// ---------- Jittered backoff ----------

function jitteredDelay(attempt: number): number {
  const exponential = Math.min(BASE_DELAY_MS * Math.pow(2, attempt), MAX_DELAY_MS);
  const jitter = Math.random() * BASE_DELAY_MS;
  return exponential + jitter;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------- Retry eligibility ----------

function isRetryableMethod(config: InternalAxiosRequestConfig): boolean {
  const method = config.method?.toUpperCase() ?? '';
  // GET always retryable
  if (method === 'GET') return true;
  // POST only if Idempotency-Key is present
  if (method === 'POST' && config.headers?.['Idempotency-Key']) return true;
  return false;
}

function isRetryableError(error: AxiosError): boolean {
  // Network errors (no response)
  if (!error.response) return true;
  // Server errors (5xx)
  if (error.response.status >= 500) return true;
  // Request timeout
  if (error.code === 'ECONNABORTED') return true;
  return false;
}

// ---------- Create instance ----------

const instance: AxiosInstance = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------- Request interceptor ----------

instance.interceptors.request.use(
  (config) => {
    // Correlation ID
    const requestId = logger.generateRequestId();
    config.headers['X-Request-ID'] = requestId;
    // Store on config for logging in response interceptor
    (config as any)._requestId = requestId;
    (config as any)._startTime = Date.now();
    (config as any)._retryCount = (config as any)._retryCount ?? 0;

    // Offline check
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

// ---------- Response interceptor ----------

instance.interceptors.response.use(
  (response) => {
    const config = response.config as any;
    const duration = Date.now() - (config._startTime ?? Date.now());

    // Log success
    logger.info('request_completed', {
      requestId: config._requestId,
      method: config.method?.toUpperCase(),
      url: config.url,
      status: response.status,
      duration_ms: duration,
      retries: config._retryCount ?? 0,
    });

    // Metrics
    logger.metric('api_request_count');
    logger.metric('api_total_latency_ms', duration);

    // Report success to backend status
    backendStatus.reportSuccess();

    // Clean up dedup map
    const key = dedupKey(response.config);
    if (key) inflightRequests.delete(key);

    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as any;
    if (!config) return Promise.reject(error);

    const retryCount: number = config._retryCount ?? 0;
    const duration = Date.now() - (config._startTime ?? Date.now());

    // Clean up dedup map on failure
    const key = dedupKey(config);
    if (key) inflightRequests.delete(key);

    // Log the failure
    logger.warn('request_failed', {
      requestId: config._requestId,
      method: config.method?.toUpperCase(),
      url: config.url,
      status: error.response?.status ?? 'network_error',
      duration_ms: duration,
      retries: retryCount,
      error: error.message,
    });

    // Detect cold start (timeout or 5xx with no prior success)
    const isTimeout = error.code === 'ECONNABORTED' || !error.response;
    if (isTimeout && backendStatus.getState() !== 'awake') {
      backendStatus.reportTimeout();
    }

    // Check retry eligibility
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

      // If backend is waking, wait for it first
      if (backendStatus.getState() === 'waking') {
        try {
          await backendStatus.waitForAwake();
        } catch {
          // If wait fails, try anyway
        }
      }

      await sleep(delay);

      // Reset start time for the retry
      config._startTime = Date.now();

      try {
        const result = await instance.request(config);
        logger.metric('retry_success_count');
        return result;
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    // Metrics
    logger.metric('api_request_count');
    logger.metric('api_total_latency_ms', duration);

    return Promise.reject(error);
  }
);

// ---------- Public API ----------

export const apiClient = {
  /**
   * GET request with deduplication and auto-retry.
   */
  async get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    const fullConfig = { ...config, method: 'GET', url };
    const key = `GET:${url}`;

    // Deduplication: if identical GET is in-flight, return same Promise
    const existing = inflightRequests.get(key);
    if (existing) {
      logger.info('request_deduplicated', { url, consumers: 'shared' });
      return existing as Promise<AxiosResponse<T>>;
    }

    const promise = instance.get<T>(url, config);
    inflightRequests.set(key, promise as Promise<AxiosResponse>);

    // Clean up on settle (success handled in interceptor, this catches remaining)
    promise.catch(() => inflightRequests.delete(key));

    return promise;
  },

  /**
   * POST request — no automatic retry.
   */
  async post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return instance.post<T>(url, data, config);
  },

  /**
   * POST with Idempotency-Key — safe to auto-retry.
   * Generates a client-side UUID as the idempotency key.
   */
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

  /**
   * PUT request — no automatic retry.
   */
  async put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return instance.put<T>(url, data, config);
  },

  /**
   * DELETE request — no automatic retry.
   */
  async delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return instance.delete<T>(url, config);
  },

  /**
   * Get the raw axios instance (for interceptor attachment by useAuthInterceptor).
   */
  getInstance(): AxiosInstance {
    return instance;
  },
};

export default apiClient;
