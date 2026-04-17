const app = require('./app');
require('dotenv').config({ path: '../../.env' });

// Initialize Redis
let redisClient;
try {
  const createRedisClient = require('../../shared/utils/redis.util');
  redisClient = createRedisClient();
} catch (e) {
  console.log('[Crowd Service] Error connecting to Redis:', e.message);
}

// Simulatation engine: update densities every 5 seconds
const startCrowdSim = async () => {
  if (!redisClient) return;

  setInterval(async () => {
    const stands = ['stand:North', 'stand:South', 'stand:Pavilion', 'stand:VIP East'];
    const standId = stands[Math.floor(Math.random() * stands.length)];
    const density = Math.floor(Math.random() * 10000);

    try {
      await redisClient.publish('crowd_updates', JSON.stringify({
        locationType: 'stand',
        locationId: standId,
        density,
        timestamp: new Date().toISOString()
      }));
      console.log(`[Crowd Service] Simulated update for ${standId}: ${density}`);
    } catch (e) {
      console.error('[Crowd Service] Simulated update failed:', e.message);
    }
  }, 5000);
};
startCrowdSim();

const PORT = process.env.CROWD_SERVICE_PORT || process.env.PORT || 4002;

app.listen(PORT, () => {
  console.log(`[Crowd Service] listening on port ${PORT}`);
});
