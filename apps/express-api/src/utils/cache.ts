import { logger } from './logger'

interface CacheItem {
  value: any
  expiresAt: number
}

const cache = new Map<string, CacheItem>()

export function cacheGet<T = any>(key: string): T | null {
  const item = cache.get(key)
  if (!item) return null

  if (Date.now() > item.expiresAt) {
    cache.delete(key)
    logger.debug({ key }, 'Cache key expired')
    return null
  }

  logger.debug({ key }, 'Cache hit')
  return item.value as T
}

export function cacheSet(key: string, value: any, ttlMs = 60 * 1000): void {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
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
  logger.debug('Cache cleared completely')
}
