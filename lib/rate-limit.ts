import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { NextRequest } from 'next/server'

// Create Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Create rate limiters for different actions
export const purchaseRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 purchases per hour
  analytics: true,
  prefix: 'ratelimit:purchase',
})

export const verifyRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 verification attempts per minute
  analytics: true,
  prefix: 'ratelimit:verify',
})

// Helper function to check rate limit
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
}> {
  try {
    const result = await limiter.limit(identifier)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // Default to allowing the request if rate limiting fails
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    }
  }
}

// Helper function to generate rate limit headers
export function getRateLimitHeaders(result: Awaited<ReturnType<typeof checkRateLimit>>) {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  }
}

type RateLimitOptions = {
  uniqueTokenPerInterval?: number
  interval?: number
}

export async function rateLimit(
  req: NextRequest,
  limit: number,
  duration: string
) {
  try {
    // Initialize Redis client
    const redis = Redis.fromEnv()
    
    // Parse duration (e.g., '1m', '5s', '1h')
    const durationInSeconds = parseDuration(duration)
    
    // Get IP address from request
    const ip = req.ip ?? '127.0.0.1'
    
    // Create a unique identifier for this rate limit
    // Format: rate_limit:{ip}:{path}
    const path = req.nextUrl.pathname
    const identifier = `rate_limit:${ip}:${path}`
    
    // Increment the counter for this identifier
    const count = await redis.incr(identifier)
    
    // Set expiry on the first request
    if (count === 1) {
      await redis.expire(identifier, durationInSeconds)
    }
    
    // Get the remaining time to live for this key
    const ttl = await redis.ttl(identifier)
    
    // Check if the limit has been exceeded
    const success = count <= limit
    const remaining = Math.max(0, limit - count)
    
    return {
      success,
      limit,
      remaining,
      reset: Date.now() + ttl * 1000
    }
  } catch (error) {
    console.error('Rate limit error:', error)
    
    // If there's an error with rate limiting, allow the request to proceed
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now()
    }
  }
}

// Helper function to parse duration strings like '1m', '5s', '1h'
function parseDuration(duration: string): number {
  const value = parseInt(duration.slice(0, -1), 10)
  const unit = duration.slice(-1).toLowerCase()
  
  switch (unit) {
    case 's':
      return value
    case 'm':
      return value * 60
    case 'h':
      return value * 60 * 60
    case 'd':
      return value * 60 * 60 * 24
    default:
      return 60 // Default to 1 minute
  }
} 