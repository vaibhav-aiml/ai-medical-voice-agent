import { BACKEND_URL } from '../config/api';
import logger from './logger';
export type BackendState = 'unknown' | 'awake' | 'waking' | 'unavailable';

type StateListener = (state: BackendState) => void;
let currentState: BackendState = 'unknown';
let pollTimer: ReturnType<typeof setInterval> | null = null;
let consecutiveFailures = 0;
let wakingStartedAt = 0;
const MAX_POLL_FAILURES = 5;
const POLL_INTERVAL_MS = 4000;
const PING_TIMEOUT_MS = 8000;

const listeners = new Set<StateListener>();
function setState(next: BackendState): void {
  if (next === currentState) return;
  const prev = currentState;
  currentState = next;
  logger.info('backend_state_change', { from: prev, to: next });

  if (next === 'awake' && wakingStartedAt > 0) {
    const duration = Date.now() - wakingStartedAt;
    logger.info('backend_woke', { cold_start_duration_ms: duration });
    logger.metric('cold_start_count');
    logger.metric('cold_start_total_duration_ms', duration);
    wakingStartedAt = 0;
  }

  listeners.forEach((fn) => {
    try { fn(next); } catch {  }
  });
}

function stopPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

async function pingBackend(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

  try {
    const res = await fetch(`${BACKEND_URL}/health/ping`, {
      method: 'GET',
      signal: controller.signal,
      
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    clearTimeout(timeout);
    return false;
  }
}

function startPolling(): void {
  if (pollTimer) return; 

  pollTimer = setInterval(async () => {
    const alive = await pingBackend();

    if (alive) {
      consecutiveFailures = 0;
      stopPolling();
      setState('awake');
    } else {
      consecutiveFailures++;
      logger.warn('backend_ping_failed', {
        attempt: consecutiveFailures,
        max: MAX_POLL_FAILURES,
      });

      if (consecutiveFailures >= MAX_POLL_FAILURES) {
        stopPolling();
        setState('unavailable');
        logger.error('backend_unavailable', {
          consecutive_failures: consecutiveFailures,
        });
        logger.metric('circuit_breaker_trip_count');
      }
    }
  }, POLL_INTERVAL_MS);
}
export const backendStatus = {
  getState(): BackendState {
    return currentState;
  },
  reportSuccess(): void {
    if (currentState !== 'awake') {
      consecutiveFailures = 0;
      stopPolling();
      setState('awake');
    }
  },
  reportTimeout(): void {
    if (currentState === 'waking') return; 
    if (currentState === 'unavailable') return; 

    wakingStartedAt = Date.now();
    consecutiveFailures = 0;
    setState('waking');
    logger.warn('backend_cold', { triggered_at: new Date().toISOString() });
    startPolling();
  },
  userRetry(): void {
    consecutiveFailures = 0;
    wakingStartedAt = Date.now();
    setState('waking');
    startPolling();
  },
  subscribe(listener: StateListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  waitForAwake(): Promise<void> {
    if (currentState === 'awake') return Promise.resolve();

    return new Promise((resolve) => {
      const unsub = backendStatus.subscribe((state) => {
        if (state === 'awake') {
          unsub();
          resolve();
        }
      });
    });
  },
};

export default backendStatus;