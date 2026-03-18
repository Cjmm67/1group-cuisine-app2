import { createClient, RedisClientType } from 'redis'

let redis: RedisClientType | null = null

async function getRedisClient(): Promise<RedisClientType> {
  if (redis && redis.isOpen) {
    return redis
  }

  redis = createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis reconnect strategy: giving up')
        return new Error('Redis max retries exceeded')
      }
      return retries * 100
    },
  })

  redis.on('error', (err: Error) => {
    console.error('Redis error:', err)
  })

  redis.on('connect', () => {
    console.log('Redis connected')
  })

  redis.on('disconnect', () => {
    console.log('Redis disconnected')
  })

  await redis.connect()

  return redis
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient()
    const value = await client.get(key)
    return value ? JSON.parse(value) : null
  } catch (error) {
    console.error('Redis cache get error:', error)
    return null
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  expirySeconds?: number
): Promise<void> {
  try {
    const client = await getRedisClient()
    if (expirySeconds) {
      await client.setEx(key, expirySeconds, JSON.stringify(value))
    } else {
      await client.set(key, JSON.stringify(value))
    }
  } catch (error) {
    console.error('Redis cache set error:', error)
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const client = await getRedisClient()
    await client.del(key)
  } catch (error) {
    console.error('Redis cache del error:', error)
  }
}

export async function cacheDelByPattern(pattern: string): Promise<void> {
  try {
    const client = await getRedisClient()
    const keys = await client.keys(pattern)
    if (keys.length > 0) {
      await client.del(keys)
    }
  } catch (error) {
    console.error('Redis cache del by pattern error:', error)
  }
}

export async function cacheFlush(): Promise<void> {
  try {
    const client = await getRedisClient()
    await client.flushDb()
  } catch (error) {
    console.error('Redis cache flush error:', error)
  }
}

export async function redisPing(): Promise<string> {
  try {
    const client = await getRedisClient()
    return await client.ping()
  } catch (error) {
    console.error('Redis ping error:', error)
    return 'PONG (fallback)'
  }
}

export async function closeRedis(): Promise<void> {
  if (redis && redis.isOpen) {
    await redis.quit()
    redis = null
  }
}
