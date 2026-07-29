/**
 * Backend cold-start state tracker.
 *
 * NOT used as a pre-flight check — only triggered when an API request
 * times out or fails. apiClient calls reportTimeout() and subscribes
 * to state changes to know when to retry.
 *
 * State machine:
 *   'unknown' → API succeeds       → 'awake'
 *   'unknown' → API times out      → 'waking' → poll /health/ping every 4s
 *   'waking'  → ping responds      → 'awake'
 *   'waking'  → 5 consecutive fail → 'unavailable' (circuit breaker)
 *   'unavailable' → userRetry()    → 'waking'
 */

import { BACKEND_URL } from '../config/api';
import logger from './logger';

// ---------- Types ----------

export type BackendState = 'unknown' | 'awake' | 'waking' | 'unavailable';

type StateListener = (state: BackendState) => void;

// ---------- State ----------

let currentState: BackendState = 'unknown';
let pollTimer: ReturnType<typeof setInterval> | null = null;
let consecutiveFailures = 0;
let wakingStartedAt = 0;
const MAX_POLL_FAILURES = 5;
const POLL_INTERVAL_MS = 4000;
const PING_TIMEOUT_MS = 8000;

const listeners = new Set<StateListener>();

// ---------- Helpers ----------

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
    try { fn(next); } catch { /* listener errors non-critical */ }
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
      // Don't use apiClient here to avoid circular dependency
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    clearTimeout(timeout);
    return false;
  }
}

function startPolling(): void {
  if (pollTimer) return; // already polling

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

// ---------- Public API ----------

export const backendStatus = {
  /**
   * Get current state.
   */
  getState(): BackendState {
    return currentState;
  },

  /**
   * Called by apiClient when a request succeeds.
   * Confirms backend is alive.
   */
  reportSuccess(): void {
    if (currentState !== 'awake') {
      consecutiveFailures = 0;
      stopPolling();
      setState('awake');
    }
  },

  /**
   * Called by apiClient when a request times out or gets a network error.
   * Triggers wake-up polling if not already in progress.
   */
  reportTimeout(): void {
    if (currentState === 'waking') return; // already polling
    if (currentState === 'unavailable') return; // circuit open

    wakingStartedAt = Date.now();
    consecutiveFailures = 0;
    setState('waking');
    logger.warn('backend_cold', { triggered_at: new Date().toISOString() });
    startPolling();
  },

  /**
   * Called when user clicks "Retry" from the unavailable state.
   * Resets circuit breaker and starts polling again.
   */
  userRetry(): void {
    consecutiveFailures = 0;
    wakingStartedAt = Date.now();
    setState('waking');
    startPolling();
  },

  /**
   * Subscribe to state changes. Returns unsubscribe function.
   */
  subscribe(listener: StateListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * Returns a Promise that resolves when backend is awake.
   * If already awake, resolves immediately.
   * Used internally by useVoiceSocket — NOT by UI components.
   */
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
