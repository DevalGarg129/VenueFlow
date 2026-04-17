const Redis = require('ioredis');

const createRedisClient = () => {
  const isDocker = process.env.DOCKER_ENV === 'true';
  let host = process.env.REDIS_HOST || 'localhost';
  
  // Smart fallback: If host is "redis" but we aren't in Docker, use localhost
  if (host === 'redis' && !isDocker) {
    host = 'localhost';
    console.log('[Redis] Running outside Docker, falling back to localhost');
  }

  const redisConfig = {
    host,
    port: process.env.REDIS_PORT || 6379,
    lazyConnect: true, // Don't crash immediately
    retryStrategy(times) {
      if (times > 10) return null; // Stop retrying after 10 attempts
      return Math.min(times * 100, 3000);
    }
  };

  if (process.env.REDIS_PASSWORD) {
    redisConfig.password = process.env.REDIS_PASSWORD;
    console.log('[Redis] Configured with password authentication');
  }

  const redis = new Redis(redisConfig);

  // Handle errors immediately to prevent "Unhandled error event"
  redis.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
      console.warn(`[Redis] Connection refused on ${host}:${process.env.REDIS_PORT || 6379}. Check if Redis is running.`);
    } else {
      console.error('[Redis] Error:', err.message);
    }
  });

  redis.on('connect', () => {
    console.log(`[Redis] Connected Successfully to ${host}`);
  });

  // Connect manually
  redis.connect().catch(() => {}); 

  return redis;
};

module.exports = createRedisClient;
