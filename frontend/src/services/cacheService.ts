/**
 * Abstract cache layer.
 *
 * Uses localStorage today. Can be swapped to IndexedDB or React Query cache
 * without touching consumers.
 *
 * Features:
 * - Optional TTL per key
 * - Graceful degradation if storage is full/unavailable
 * - Key namespacing to avoid collisions
 * - Multi-tab synchronisation via BroadcastChannel (fallback to storage event)
 */

import logger from './logger';

// ---------- Types ----------

interface CacheEntry<T> {
  value: T;
  /** Unix timestamp (ms) when this entry expires. 0 = never. */
  expiresAt: number;
  /** Unix timestamp (ms) when this entry was written. Used for conflict resolution. */
  writtenAt: number;
}

type CacheListener = (key: string, value: unknown) => void;

// ---------- Constants ----------

const NAMESPACE = 'mv_';
const BROADCAST_CHANNEL_NAME = 'medivoice_cache_sync';

// ---------- Multi-tab sync ----------

let broadcastChannel: BroadcastChannel | null = null;
const tabSyncListeners = new Set<CacheListener>();

try {
  broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  broadcastChannel.onmessage = (event) => {
    const { key, value } = event.data ?? {};
    if (key) {
      tabSyncListeners.forEach((fn) => {
        try {
          fn(key, value);
        } catch {
          // Listener errors are non-critical
        }
      });
    }
  };
} catch {
  // BroadcastChannel not supported — fall back to storage event
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key?.startsWith(NAMESPACE) && event.newValue) {
        const publicKey = event.key.slice(NAMESPACE.length);
        try {
          const parsed: CacheEntry<unknown> = JSON.parse(event.newValue);
          tabSyncListeners.forEach((fn) => {
            try {
              fn(publicKey, parsed.value);
            } catch {
              // non-critical
            }
          });
        } catch {
          // non-critical
        }
      }
    });
  }
}

// ---------- Helpers ----------

function namespacedKey(key: string): string {
  return `${NAMESPACE}${key}`;
}

function isExpired(entry: CacheEntry<unknown>): boolean {
  return entry.expiresAt > 0 && Date.now() > entry.expiresAt;
}

// ---------- Public API ----------

export const cacheService = {
  /**
   * Get a value from cache. Returns null if missing or expired.
   */
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(namespacedKey(key));
      if (!raw) {
        logger.metric('cache_miss_count');
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(raw);

      if (isExpired(entry)) {
        localStorage.removeItem(namespacedKey(key));
        logger.metric('cache_miss_count');
        return null;
      }

      logger.metric('cache_hit_count');
      return entry.value;
    } catch {
      logger.metric('cache_miss_count');
      return null;
    }
  },

  /**
   * Set a value in cache.
   * @param ttlMs Time-to-live in milliseconds. 0 or omitted = no expiry.
   */
  set<T>(key: string, value: T, ttlMs: number = 0): void {
    try {
      const entry: CacheEntry<T> = {
        value,
        expiresAt: ttlMs > 0 ? Date.now() + ttlMs : 0,
        writtenAt: Date.now(),
      };
      localStorage.setItem(namespacedKey(key), JSON.stringify(entry));

      // Broadcast to other tabs
      broadcastChannel?.postMessage({ key, value });
    } catch (err) {
      logger.warn('cache_write_failed', {
        key,
        error: err instanceof Error ? err.message : 'Unknown',
      });
    }
  },

  /**
   * Remove a key from cache.
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(namespacedKey(key));
      broadcastChannel?.postMessage({ key, value: null });
    } catch {
      // non-critical
    }
  },

  /**
   * Clear all namespaced cache entries.
   */
  clear(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(NAMESPACE)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // non-critical
    }
  },

  /**
   * Get the writtenAt timestamp for a key. Used for conflict resolution.
   */
  getTimestamp(key: string): number | null {
    try {
      const raw = localStorage.getItem(namespacedKey(key));
      if (!raw) return null;
      const entry: CacheEntry<unknown> = JSON.parse(raw);
      return entry.writtenAt;
    } catch {
      return null;
    }
  },

  /**
   * Subscribe to cache updates from other tabs.
   * Returns an unsubscribe function.
   */
  onTabSync(listener: CacheListener): () => void {
    tabSyncListeners.add(listener);
    return () => {
      tabSyncListeners.delete(listener);
    };
  },
};

export default cacheService;
