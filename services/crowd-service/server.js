const app = require('./app');
require('dotenv').config({ path: '../../.env' });

const { getProducer, ensureTopics } = require('../../shared/utils/kafka.util');

// Ensure the topic exists
ensureTopics(['crowd_updates']);

// Simulatation engine: update densities every 5 seconds
const startCrowdSim = async () => {
  setInterval(async () => {
    const stands = ['stand:North', 'stand:South', 'stand:Pavilion', 'stand:VIP East'];
    const standId = stands[Math.floor(Math.random() * stands.length)];
    const density = Math.floor(Math.random() * 10000);

    const payload = {
        locationType: 'stand',
        locationId: standId,
        density,
        timestamp: new Date().toISOString()
    };

    try {
      const producer = await getProducer();
      await producer.send({
        topic: 'crowd_updates',
        messages: [{ value: JSON.stringify(payload) }]
      });
      console.log(`[Crowd Service] Simulated update published to Kafka: ${standId}: ${density}`);
    } catch (e) {
      console.error('[Crowd Service] Simulated update failed:', e.message);
    }
  }, 5000);
};
startCrowdSim();

const PORT = process.env.CROWD_SERVICE_PORT || process.env.PORT || 4002;

const server = app.listen(PORT, () => {
  console.log(`[Crowd Service] listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Crowd Service] SIGTERM received. Shutting down...');
  await disconnectAll();
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('[Crowd Service] SIGINT received. Shutting down...');
  await disconnectAll();
  server.close(() => {
    process.exit(0);
  });
});
