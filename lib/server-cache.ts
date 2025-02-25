import { LRUCache } from 'lru-cache'
import { getCache, setCache, deleteCache } from './redis'

const DEFAULT_MAX_AGE = 1000 * 60 * 5 // 5 minutes
const DEFAULT_MAX_SIZE = 500 // Maximum number of items

interface CacheOptions {
  maxAge?: number
  maxSize?: number
  useRedis?: boolean
}

class ServerCache {
  private cache: LRUCache<string, any>
  private useRedis: boolean

  constructor(options: CacheOptions = {}) {
    const { 
      maxAge = DEFAULT_MAX_AGE, 
      maxSize = DEFAULT_MAX_SIZE,
      useRedis = true
    } = options

    this.useRedis = useRedis
    this.cache = new LRUCache({
      max: maxSize,
      ttl: maxAge,
      updateAgeOnGet: true,
      updateAgeOnHas: true,
    })
  }

  async get<T>(
    key: string,
    fetchFn: () => Promise<T>,
    maxAge?: number
  ): Promise<T> {
    // Try LRU cache first
    const localCached = this.cache.get(key)
    if (localCached !== undefined) {
      return localCached as T
    }

    // Try Redis cache if enabled
    if (this.useRedis) {
      const redisCached = await getCache<T>(key)
      if (redisCached !== null) {
        // Update LRU cache
        this.cache.set(key, redisCached)
        return redisCached
      }
    }

    // If not in any cache, fetch fresh data
    const fresh = await fetchFn()

    // Update both caches
    this.cache.set(key, fresh)
    if (this.useRedis) {
      await setCache(key, fresh, Math.floor(maxAge || DEFAULT_MAX_AGE / 1000))
    }

    return fresh
  }

  async set(key: string, value: any, maxAge?: number): Promise<void> {
    this.cache.set(key, value)
    if (this.useRedis) {
      await setCache(key, value, Math.floor(maxAge || DEFAULT_MAX_AGE / 1000))
    }
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key)
    if (this.useRedis) {
      await deleteCache(key)
    }
  }

  clear(): void {
    this.cache.clear()
    // Note: Redis clear is not implemented as it might affect other services
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }
}

// Create different cache instances for different purposes
export const pageCache = new ServerCache({ 
  maxAge: 1000 * 60 * 5, // 5 minutes for pages
  useRedis: true
})

export const apiCache = new ServerCache({ 
  maxAge: 1000 * 30, // 30 seconds for API responses
  useRedis: true
})

export const staticCache = new ServerCache({ 
  maxAge: 1000 * 60 * 60, // 1 hour for static data
  useRedis: true
}) 