const app = require('./app');
require('dotenv').config({ path: '../../.env' });

// Initialize Redis
let redisClient;
try {
  const createRedisClient = require('../../shared/utils/redis.util');
  redisClient = createRedisClient();
} catch (e) {
  console.log('[Queue Service] Error connecting to Redis:', e.message);
}

// Simulatation engine: update queues every 7 seconds
const startQueueSim = async () => {
    if (!redisClient) return;

    setInterval(async () => {
        const services = [
            { type: 'stall', id: 'stall:12' },
            { type: 'stall', id: 'stall:15' },
            { type: 'restroom', id: 'restroom:3' }
        ];
        const service = services[Math.floor(Math.random() * services.length)];
        const waitTime = Math.floor(Math.random() * 20 * 60 * 1000); // 0-20 min
        
        try {
            await redisClient.publish('queue_updates', JSON.stringify({
                serviceType: service.type,
                serviceId: service.id,
                estimatedWaitMs: waitTime,
                timestamp: new Date().toISOString()
            }));
            console.log(`[Queue Service] Simulated update for ${service.id}: ${waitTime}ms`);
        } catch(e) {
            console.error('[Queue Service] Simulated update failed:', e.message);
        }
    }, 7000);
};
startQueueSim();

const PORT = process.env.QUEUE_SERVICE_PORT || process.env.PORT || 4003;

app.listen(PORT, () => {
  console.log(`[Queue Service] listening on port ${PORT}`);
});
