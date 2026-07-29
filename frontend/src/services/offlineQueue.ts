/**
 * Offline write queue.
 *
 * Queues failed POST/PUT requests and replays them when the backend
 * comes back online. Persists in CacheService so the queue survives
 * page refreshes.
 *
 * Conflict resolution: last-write-wins with timestamp.
 * Items older than 24 hours are discarded (stale data safety).
 */

import cacheService from './cacheService';
import logger from './logger';
import backendStatus from './backendStatus';

// ---------- Types ----------

export interface QueuedRequest {
  id: string;
  method: 'POST' | 'PUT';
  url: string;
  data: any;
  timestamp: number;
  retries: number;
  idempotencyKey?: string;
}

// ---------- Constants ----------

const CACHE_KEY = 'offline_queue';
const MAX_RETRIES_PER_ITEM = 3;
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// ---------- State ----------

let isReplaying = false;

// ---------- Helpers ----------

function getQueue(): QueuedRequest[] {
  return cacheService.get<QueuedRequest[]>(CACHE_KEY) ?? [];
}

function saveQueue(queue: QueuedRequest[]): void {
  cacheService.set(CACHE_KEY, queue);
}

function generateId(): string {
  return crypto.randomUUID?.() ?? `oq_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Purge items older than MAX_AGE_MS.
 */
function purgeStale(queue: QueuedRequest[]): QueuedRequest[] {
  const now = Date.now();
  const filtered = queue.filter((item) => {
    const age = now - item.timestamp;
    if (age > MAX_AGE_MS) {
      logger.warn('offline_queue_item_expired', {
        id: item.id,
        url: item.url,
        age_hours: Math.round(age / (60 * 60 * 1000)),
      });
      return false;
    }
    return true;
  });
  return filtered;
}

// ---------- Replay engine ----------

async function replayQueue(): Promise<void> {
  if (isReplaying) return;
  isReplaying = true;

  let queue = purgeStale(getQueue());
  if (queue.length === 0) {
    isReplaying = false;
    return;
  }

  logger.info('offline_queue_replay_start', { items: queue.length });

  const completed: string[] = [];
  const failed: string[] = [];

  for (const item of queue) {
    if (item.retries >= MAX_RETRIES_PER_ITEM) {
      logger.error('offline_queue_item_max_retries', {
        id: item.id,
        url: item.url,
        retries: item.retries,
      });
      completed.push(item.id); // remove from queue, it's exhausted
      continue;
    }

    try {
      // Use raw fetch to avoid apiClient interceptor loops
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (item.idempotencyKey) {
        headers['Idempotency-Key'] = item.idempotencyKey;
      }

      const response = await fetch(item.url, {
        method: item.method,
        headers,
        body: JSON.stringify(item.data),
        signal: AbortSignal.timeout(25_000),
      });

      if (response.ok) {
        completed.push(item.id);
        logger.info('offline_queue_item_replayed', {
          id: item.id,
          url: item.url,
          status: response.status,
        });
        logger.metric('offline_queue_replay_count');
        logger.metric('offline_queue_replay_success_count');
      } else {
        item.retries++;
        failed.push(item.id);
        logger.warn('offline_queue_item_failed', {
          id: item.id,
          url: item.url,
          status: response.status,
          retries: item.retries,
        });
        logger.metric('offline_queue_replay_count');
      }
    } catch (err) {
      item.retries++;
      failed.push(item.id);
      logger.warn('offline_queue_item_error', {
        id: item.id,
        url: item.url,
        error: err instanceof Error ? err.message : 'Unknown',
        retries: item.retries,
      });
      logger.metric('offline_queue_replay_count');
      // If we're offline or backend down again, stop replaying
      if (typeof navigator !== 'undefined' && !navigator.onLine) break;
    }
  }

  // Update queue: remove completed, keep failed with updated retry counts
  queue = queue.filter((item) => !completed.includes(item.id));
  saveQueue(queue);

  logger.info('offline_queue_replay_complete', {
    replayed: completed.length,
    remaining: queue.length,
  });

  isReplaying = false;
}

// ---------- Auto-replay triggers ----------

// Replay when browser comes back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    logger.info('network_online');
    // Small delay to let network stabilize
    setTimeout(() => replayQueue(), 2000);
  });
}

// Replay when backend becomes awake
backendStatus.subscribe((state) => {
  if (state === 'awake') {
    setTimeout(() => replayQueue(), 1000);
  }
});

// ---------- Public API ----------

export const offlineQueue = {
  /**
   * Add a failed write request to the queue.
   */
  enqueue(request: Omit<QueuedRequest, 'id' | 'retries' | 'timestamp'>): void {
    const queue = getQueue();
    const item: QueuedRequest = {
      ...request,
      id: generateId(),
      retries: 0,
      timestamp: Date.now(),
    };
    queue.push(item);
    saveQueue(queue);

    logger.info('offline_queue_enqueued', {
      id: item.id,
      method: item.method,
      url: item.url,
      queue_size: queue.length,
    });
  },

  /**
   * Get current queue size.
   */
  size(): number {
    return getQueue().length;
  },

  /**
   * Get the current queue contents.
   */
  getItems(): QueuedRequest[] {
    return getQueue();
  },

  /**
   * Manually trigger a replay attempt.
   */
  replay(): Promise<void> {
    return replayQueue();
  },

  /**
   * Clear the queue.
   */
  clear(): void {
    saveQueue([]);
    logger.info('offline_queue_cleared');
  },
};

export default offlineQueue;
