import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function GET() {
  try {
    // Test connection by setting and getting a value
    await redis.set('test-key', 'Redis connection successful!')
    const value = await redis.get('test-key')
    
    return NextResponse.json({ 
      status: 'success',
      message: value,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Redis connection error:', error)
    return NextResponse.json({ 
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to connect to Redis'
    }, { status: 500 })
  }
} 