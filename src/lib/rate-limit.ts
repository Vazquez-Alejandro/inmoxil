import { Redis } from '@upstash/redis'

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    })
  : null

export async function checkRateLimit(key: string, maxRequests: number, windowMs: number): Promise<{ allowed: boolean; retryAfter?: number }> {
  if (!redis) {
    return { allowed: true }
  }

  const now = Date.now()
  const windowKey = `ratelimit:${key}:${Math.floor(now / windowMs)}`

  const count = await redis.incr(windowKey)
  if (count === 1) {
    await redis.expire(windowKey, Math.ceil(windowMs / 1000))
  }

  if (count > maxRequests) {
    const ttl = await redis.ttl(windowKey)
    return { allowed: false, retryAfter: ttl > 0 ? ttl : Math.ceil(windowMs / 1000) }
  }

  return { allowed: true }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || 'unknown'
}
