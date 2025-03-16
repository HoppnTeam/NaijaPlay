import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Redis } from '@upstash/redis';

/**
 * Health check endpoint to verify the application is running correctly
 * Checks database and Redis connections
 */
export async function GET() {
  try {
    // Get package.json version
    const packageJson = require('../../../package.json');
    const version = packageJson.version;

    // Check Supabase connection
    const supabase = createClient();
    const { data: dbCheck, error: dbError } = await supabase.from('health_checks').select('*').limit(1);
    
    // Check Redis connection
    let redisStatus = 'unknown';
    try {
      const redis = Redis.fromEnv();
      await redis.set('health_check', 'ok', { ex: 60 });
      const redisCheck = await redis.get('health_check');
      redisStatus = redisCheck === 'ok' ? 'connected' : 'error';
    } catch (redisError) {
      console.error('Redis health check failed:', redisError);
      redisStatus = 'error';
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version,
      database: {
        status: dbError ? 'error' : 'connected',
        error: dbError ? dbError.message : null,
      },
      redis: {
        status: redisStatus,
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 