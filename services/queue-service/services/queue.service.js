let redisClient;
try {
  const createRedisClient = require('../../../shared/utils/redis.util');
  redisClient = createRedisClient();
} catch(e) {
  console.error('[Queue Service] Failed to load shared redis util:', e);
  const Redis = require('ioredis');
  redisClient = new Redis({ host: process.env.REDIS_HOST || 'localhost' });
  redisClient.on('error', (err) => console.error('[Queue Service] Redis Error:', err.message));
}

// const { publishQueueUpdate } = require('../producers/queue.producer');

exports.updateQueue = async (serviceType, serviceId, addedTimeMs, resolvedTimeMs) => {
  const key = `queue:${serviceType}:${serviceId}`;
  let currentWait = parseInt(await redisClient.get(key) || '0');

  if (addedTimeMs) currentWait += addedTimeMs;
  if (resolvedTimeMs) currentWait = Math.max(0, currentWait - resolvedTimeMs);

  await redisClient.set(key, currentWait);

  await redisClient.publish('queue_updates', JSON.stringify({
    serviceType,
    serviceId,
    estimatedWaitMs: currentWait,
    timestamp: new Date().toISOString()
  }));

  return currentWait;
};

exports.getQueue = async (serviceType, serviceId) => {
  const key = `queue:${serviceType}:${serviceId}`;
  return parseInt(await redisClient.get(key) || '0');
};
