const app = require('./app');

let kafkaClient;
try {
  const KafkaClient = require('../../shared/utils/kafka.util');
  kafkaClient = new KafkaClient('queue-service');
  kafkaClient.connectProducer().catch(console.error);
} catch(e) {}

// Simulatation engine: update queues every 7 seconds
const startQueueSim = async () => {
    try {
        const KafkaClient = require('../../shared/utils/kafka.util');
        const kafka = new KafkaClient('queue-service-sim');
        await kafka.connectProducer();

        setInterval(async () => {
            const services = [
                { type: 'stall', id: 'Snacks Stall B' },
                { type: 'stall', id: 'Merch Store' }
            ];
            const service = services[Math.floor(Math.random() * services.length)];
            const waitTime = Math.floor(Math.random() * 20 * 60 * 1000); // 0-20 min
            
            try {
                await kafka.send('queue_updates', {
                    serviceType: service.type,
                    serviceId: service.id,
                    estimatedWaitMs: waitTime,
                    timestamp: new Date().toISOString()
                });
                console.log(`[Queue Service] Simulated update for ${service.id}: ${waitTime}ms`);
            } catch(e) {}
        }, 7000);
    } catch(e) {
        console.error('[Queue Service] Simulation failed to connect to Kafka (Kafka might be still starting)');
    }
};
startQueueSim();

const PORT = process.env.QUEUE_SERVICE_PORT || 4003;

app.listen(PORT, () => {
  console.log(`[Queue Service] listening on port ${PORT}`);
});
