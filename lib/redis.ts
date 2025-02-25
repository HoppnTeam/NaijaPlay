import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export default redis

// Helper functions for common cache operations
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key)
    return data
  } catch (error) {
    console.error('Redis get error:', error)
    return null
  }
}

export async function setCache<T>(
  key: string, 
  data: T, 
  expirationInSeconds = 300 // 5 minutes default
): Promise<void> {
  try {
    await redis.set(key, data, { ex: expirationInSeconds })
  } catch (error) {
    console.error('Redis set error:', error)
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    console.error('Redis delete error:', error)
  }
}

export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error('Redis pattern invalidation error:', error)
  }
} 