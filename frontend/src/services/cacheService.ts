import logger from './logger';
interface CacheEntry<T> {
  value: T;
  
  expiresAt: number;
  
  writtenAt: number;
}

type CacheListener = (key: string, value: unknown) => void;
const NAMESPACE = 'mv_';
const BROADCAST_CHANNEL_NAME = 'medivoice_cache_sync';
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
          
        }
      });
    }
  };
} catch {
  
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
              
            }
          });
        } catch {
          
        }
      }
    });
  }
}
function namespacedKey(key: string): string {
  return `${NAMESPACE}${key}`;
}

function isExpired(entry: CacheEntry<unknown>): boolean {
  return entry.expiresAt > 0 && Date.now() > entry.expiresAt;
}
export const cacheService = {
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
  set<T>(key: string, value: T, ttlMs: number = 0): void {
    try {
      const entry: CacheEntry<T> = {
        value,
        expiresAt: ttlMs > 0 ? Date.now() + ttlMs : 0,
        writtenAt: Date.now(),
      };
      localStorage.setItem(namespacedKey(key), JSON.stringify(entry));
      broadcastChannel?.postMessage({ key, value });
    } catch (err) {
      logger.warn('cache_write_failed', {
        key,
        error: err instanceof Error ? err.message : 'Unknown',
      });
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(namespacedKey(key));
      broadcastChannel?.postMessage({ key, value: null });
    } catch {
      
    }
  },
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
      
    }
  },
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
  onTabSync(listener: CacheListener): () => void {
    tabSyncListeners.add(listener);
    return () => {
      tabSyncListeners.delete(listener);
    };
  },
};

export default cacheService;