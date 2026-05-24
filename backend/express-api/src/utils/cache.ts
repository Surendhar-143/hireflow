import { logger } from './logger'

interface CacheItem {
  value: any
  expiresAt: number
  lastAccessed: number
}

// Metrics for observability
let hits = 0
let misses = 0

const cache = new Map<string, CacheItem>()

/** Maximum entries before LRU eviction triggers */
const MAX_ENTRIES = 500
/** Fraction of entries to evict when limit is hit (evict oldest 20%) */
const EVICT_FRACTION = 0.2

/**
 * Evict the oldest (least-recently-accessed) entries when cache exceeds MAX_ENTRIES.
 * This prevents unbounded memory growth in long-running processes.
 */
function evictIfNeeded(): void {
  if (cache.size < MAX_ENTRIES) return

  const evictCount = Math.ceil(MAX_ENTRIES * EVICT_FRACTION)
  const entries = [...cache.entries()].sort(
    ([, a], [, b]) => a.lastAccessed - b.lastAccessed
  )

  for (let i = 0; i < evictCount && i < entries.length; i++) {
    const [key] = entries[i]
    cache.delete(key)
    logger.debug({ key }, 'Cache key evicted (LRU)')
  }

  logger.debug({ evictCount, remaining: cache.size }, 'Cache LRU eviction complete')
}

export function cacheGet<T = any>(key: string): T | null {
  const item = cache.get(key)
  if (!item) {
    misses++
    return null
  }

  if (Date.now() > item.expiresAt) {
    cache.delete(key)
    misses++
    logger.debug({ key }, 'Cache key expired')
    return null
  }

  // Update LRU access time
  item.lastAccessed = Date.now()
  hits++
  logger.debug({ key }, 'Cache hit')
  return item.value as T
}

export function cacheSet(key: string, value: any, ttlMs = 60 * 1000): void {
  evictIfNeeded()
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
    lastAccessed: Date.now(),
  })
  logger.debug({ key, ttlMs }, 'Cache key stored')
}

export function cacheDelete(key: string): boolean {
  const deleted = cache.delete(key)
  if (deleted) {
    logger.debug({ key }, 'Cache key invalidated')
  }
  return deleted
}

export function cacheDeletePattern(pattern: RegExp): void {
  for (const key of cache.keys()) {
    if (pattern.test(key)) {
      cache.delete(key)
      logger.debug({ key }, 'Cache key invalidated by pattern match')
    }
  }
}

export function cacheClear(): void {
  cache.clear()
  hits = 0
  misses = 0
  logger.debug('Cache cleared completely')
}

/**
 * Returns current cache statistics for monitoring/health endpoints.
 */
export function cacheStats(): {
  size: number
  maxSize: number
  hits: number
  misses: number
  hitRate: string
} {
  const total = hits + misses
  return {
    size: cache.size,
    maxSize: MAX_ENTRIES,
    hits,
    misses,
    hitRate: total > 0 ? `${((hits / total) * 100).toFixed(1)}%` : 'N/A',
  }
}
