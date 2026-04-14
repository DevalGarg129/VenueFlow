let redisClient;
try {
  const createRedisClient = require('../../../shared/utils/redis.util');
  redisClient = createRedisClient();
} catch(e) {
  console.error('[Crowd Service] Failed to load shared redis util:', e);
  const Redis = require('ioredis');
  redisClient = new Redis({ host: process.env.REDIS_HOST || 'localhost' });
  redisClient.on('error', (err) => console.error('[Crowd Service] Redis Error:', err.message));
}

const { publishCrowdUpdate } = require('../producers/crowd.producer');

exports.updateDensity = async (locationType, locationId, count, action) => {
  const key = `crowd:${locationType}:${locationId}`;
  let currentDensity = parseInt(await redisClient.get(key) || '0');

  if (action === 'enter') currentDensity += count;
  else if (action === 'exit') currentDensity = Math.max(0, currentDensity - count);

  await redisClient.set(key, currentDensity);

  await publishCrowdUpdate('crowd_updates', {
    locationType,
    locationId,
    density: currentDensity,
    timestamp: new Date().toISOString()
  });

  if (currentDensity > 500) {
    await publishCrowdUpdate('alerts', {
      level: 'critical',
      message: `Overcrowding alert at ${locationType} ${locationId}. Redirect fans.`,
      timestamp: new Date().toISOString()
    });
  }

  return currentDensity;
};

exports.getDensity = async (locationType, locationId) => {
  const key = `crowd:${locationType}:${locationId}`;
  return parseInt(await redisClient.get(key) || '0');
};
