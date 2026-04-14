const app = require('./app');

// Initialize Kafka early
let kafkaClient;
try {
  const KafkaClient = require('../../shared/utils/kafka.util');
  kafkaClient = new KafkaClient('crowd-service');
  kafkaClient.connectProducer().catch(console.error);
} catch (e) {
  console.log('Skipping kafka connect in standalone mode. Error:', e.message);
}

// Simulatation engine: update densities every 5 seconds
const startCrowdSim = async () => {
  try {
    const KafkaClient = require('../../shared/utils/kafka.util');
    const kafka = new KafkaClient('crowd-service-sim');
    await kafka.connectProducer();

    setInterval(async () => {
      const stands = ['North', 'South', 'Pavilion'];
      const standId = stands[Math.floor(Math.random() * stands.length)];
      const density = Math.floor(Math.random() * 10000);

      try {
        await kafka.publish('crowd_updates', {
          locationType: 'stand',
          locationId: standId,
          density,
          timestamp: new Date().toISOString()
        });
        console.log(`[Crowd Service] Simulated update for ${standId}: ${density}`);
      } catch (e) {
        console.error('[Crowd Service] Simulated update failed:', e);
      }
    }, 5000);
  } catch (e) {
    console.error('[Crowd Service] Simulation failed to connect to Kafka', e);
  }
};
startCrowdSim();

const PORT = process.env.CROWD_SERVICE_PORT || 4002;

app.listen(PORT, () => {
  console.log(`[Crowd Service] listening on port ${PORT}`);
});
