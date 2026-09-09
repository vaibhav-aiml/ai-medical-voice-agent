import cacheService from './cacheService';
import logger from './logger';
import backendStatus from './backendStatus';
import apiClient from './apiClient';
export interface QueuedRequest {
  id: string;
  method: 'POST' | 'PUT';
  url: string;
  data: any;
  timestamp: number;
  retries: number;
  idempotencyKey?: string;
}
const CACHE_KEY = 'offline_queue';
const MAX_RETRIES_PER_ITEM = 3;
const MAX_AGE_MS = 24 * 60 * 60 * 1000; 
let isReplaying = false;
function getQueue(): QueuedRequest[] {
  return cacheService.get<QueuedRequest[]>(CACHE_KEY) ?? [];
}

function saveQueue(queue: QueuedRequest[]): void {
  cacheService.set(CACHE_KEY, queue);
}

function generateId(): string {
  return crypto.randomUUID?.() ?? `oq_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
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
      completed.push(item.id); 
      continue;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (item.idempotencyKey) {
        headers['Idempotency-Key'] = item.idempotencyKey;
      }

      const response = await apiClient.getInstance().request({
        url: item.url,
        method: item.method,
        headers,
        data: item.data,
        timeout: 25_000,
      });

      if (response.status >= 200 && response.status < 300) {
        completed.push(item.id);
        logger.info('offline_queue_item_replayed', {
          id: item.id,
          url: item.url,
          status: response.status,
        });
        logger.metric('offline_queue_replay_count');
        logger.metric('offline_queue_replay_success_count');
      }
    } catch (err: any) {
      const status = err.response?.status;

      // 1. AUTH FAILURE (401 / 403): PAUSE & RETAIN
      // Do not evict; token may have expired offline. Retain until re-authenticated.
      if (status === 401 || status === 403) {
        logger.warn('offline_queue_auth_paused', {
          id: item.id,
          url: item.url,
          status,
        });
        break;
      }

      // 2. TRUE POISON PILL (400, 404, 422): EVICT IMMEDIATELY
      if (status === 400 || status === 404 || status === 422) {
        logger.error('offline_queue_poison_pill_evicted', {
          id: item.id,
          url: item.url,
          status,
          error: err.response?.data?.error || err.message,
        });
        completed.push(item.id);
        continue;
      }

      // 3. TRANSIENT NETWORK / 503 ERROR
      item.retries++;
      failed.push(item.id);
      logger.warn('offline_queue_item_error', {
        id: item.id,
        url: item.url,
        status: status ?? 'network_error',
        error: err.message,
        retries: item.retries,
      });
      logger.metric('offline_queue_replay_count');

      if (item.retries >= MAX_RETRIES_PER_ITEM) {
        logger.error('offline_queue_item_max_retries', {
          id: item.id,
          url: item.url,
          retries: item.retries,
        });
        completed.push(item.id);
      }

      if (typeof navigator !== 'undefined' && !navigator.onLine) break;
    }
  }
  queue = queue.filter((item) => !completed.includes(item.id));
  saveQueue(queue);

  logger.info('offline_queue_replay_complete', {
    replayed: completed.length,
    remaining: queue.length,
  });

  isReplaying = false;
}
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    logger.info('network_online');
    
    setTimeout(() => replayQueue(), 2000);
  });
}
backendStatus.subscribe((state) => {
  if (state === 'awake') {
    setTimeout(() => replayQueue(), 1000);
  }
});
export const offlineQueue = {
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
  size(): number {
    return getQueue().length;
  },
  getItems(): QueuedRequest[] {
    return getQueue();
  },
  replay(): Promise<void> {
    return replayQueue();
  },
  clear(): void {
    saveQueue([]);
    logger.info('offline_queue_cleared');
  },
};

export default offlineQueue;