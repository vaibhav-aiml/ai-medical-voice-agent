/**
 * Frontend structured logging & metrics service.
 *
 * Logs to console in dev/prod. Designed to be pluggable — swap the
 * transport to Sentry, LogRocket, or OpenTelemetry without changing call sites.
 *
 * Every log entry includes: timestamp, sessionId, requestId (when available),
 * event name, and structured data.
 */

// ---------- Types ----------

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  event: string;
  sessionId: string;
  requestId?: string;
  data?: Record<string, unknown>;
}

interface AggregateMetrics {
  cold_start_count: number;
  cold_start_total_duration_ms: number;
  api_request_count: number;
  api_total_latency_ms: number;
  retry_count: number;
  retry_success_count: number;
  cache_hit_count: number;
  cache_miss_count: number;
  websocket_reconnect_count: number;
  offline_queue_replay_count: number;
  offline_queue_replay_success_count: number;
  circuit_breaker_trip_count: number;
}

// ---------- Session ID ----------

function getOrCreateSessionId(): string {
  const KEY = 'medivoice_session_id';
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID?.() ?? `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

const SESSION_ID = getOrCreateSessionId();

// ---------- Metrics store ----------

const metrics: AggregateMetrics = {
  cold_start_count: 0,
  cold_start_total_duration_ms: 0,
  api_request_count: 0,
  api_total_latency_ms: 0,
  retry_count: 0,
  retry_success_count: 0,
  cache_hit_count: 0,
  cache_miss_count: 0,
  websocket_reconnect_count: 0,
  offline_queue_replay_count: 0,
  offline_queue_replay_success_count: 0,
  circuit_breaker_trip_count: 0,
};

// ---------- Core logger ----------

function buildEntry(level: LogLevel, event: string, data?: Record<string, unknown>): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    event,
    sessionId: SESSION_ID,
    ...(data?.requestId ? { requestId: String(data.requestId) } : {}),
    data,
  };
}

function emit(entry: LogEntry): void {
  const prefix = `[${entry.level.toUpperCase()}] [${entry.event}]`;
  const payload = entry.data ? entry.data : '';

  switch (entry.level) {
    case 'debug':
      console.debug(prefix, payload);
      break;
    case 'info':
      console.info(prefix, payload);
      break;
    case 'warn':
      console.warn(prefix, payload);
      break;
    case 'error':
      console.error(prefix, payload);
      break;
  }

  // Future: send to external service here
  // e.g. Sentry.addBreadcrumb({ message: entry.event, data: entry.data, level: entry.level });
}

// ---------- Public API ----------

export const logger = {
  debug(event: string, data?: Record<string, unknown>): void {
    emit(buildEntry('debug', event, data));
  },

  info(event: string, data?: Record<string, unknown>): void {
    emit(buildEntry('info', event, data));
  },

  warn(event: string, data?: Record<string, unknown>): void {
    emit(buildEntry('warn', event, data));
  },

  error(event: string, data?: Record<string, unknown>): void {
    emit(buildEntry('error', event, data));
  },

  /** Record a metric increment. */
  metric(key: keyof AggregateMetrics, value: number = 1): void {
    metrics[key] += value;
  },

  /** Get current aggregate metrics snapshot. */
  getMetrics(): Readonly<AggregateMetrics> {
    return { ...metrics };
  },

  /** Computed metrics with averages and rates. */
  getComputedMetrics() {
    const m = metrics;
    return {
      ...m,
      cold_start_avg_duration_ms:
        m.cold_start_count > 0 ? Math.round(m.cold_start_total_duration_ms / m.cold_start_count) : 0,
      api_avg_latency_ms:
        m.api_request_count > 0 ? Math.round(m.api_total_latency_ms / m.api_request_count) : 0,
      retry_success_rate:
        m.retry_count > 0 ? Math.round((m.retry_success_count / m.retry_count) * 100) : 100,
      cache_hit_rate:
        m.cache_hit_count + m.cache_miss_count > 0
          ? Math.round((m.cache_hit_count / (m.cache_hit_count + m.cache_miss_count)) * 100)
          : 0,
      offline_replay_success_rate:
        m.offline_queue_replay_count > 0
          ? Math.round((m.offline_queue_replay_success_count / m.offline_queue_replay_count) * 100)
          : 100,
    };
  },

  /** Get the current session ID (used for correlation). */
  getSessionId(): string {
    return SESSION_ID;
  },

  /** Generate a unique request ID for correlation across frontend/backend. */
  generateRequestId(): string {
    return crypto.randomUUID?.() ?? `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  },
};

export default logger;
