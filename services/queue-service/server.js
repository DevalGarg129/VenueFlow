const app = require('./app');
require('dotenv').config({ path: '../../.env' });

const { getProducer, ensureTopics } = require('../../shared/utils/kafka.util');

// Ensure the topic exists
ensureTopics(['queue_updates']);

// Simulatation engine: update queues every 7 seconds
const startQueueSim = async () => {
    setInterval(async () => {
        const services = [
            { type: 'stall', id: 'stall:12' },
            { type: 'stall', id: 'stall:15' },
            { type: 'restroom', id: 'restroom:3' }
        ];
        const service = services[Math.floor(Math.random() * services.length)];
        const waitTime = Math.floor(Math.random() * 20 * 60 * 1000); // 0-20 min
        
        const payload = {
            serviceType: service.type,
            serviceId: service.id,
            estimatedWaitMs: waitTime,
            timestamp: new Date().toISOString()
        };

        try {
            const producer = await getProducer();
            await producer.send({
                topic: 'queue_updates',
                messages: [{ value: JSON.stringify(payload) }]
            });
            console.log(`[Queue Service] Simulated update published to Kafka: ${service.id}: ${waitTime}ms`);
        } catch(e) {
            console.error('[Queue Service] Simulated update failed:', e.message);
        }
    }, 7000);
};
startQueueSim();

const PORT = process.env.QUEUE_SERVICE_PORT || process.env.PORT || 4003;

const server = app.listen(PORT, () => {
  console.log(`[Queue Service] listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('[Queue Service] SIGTERM received. Shutting down...');
    await disconnectAll();
    server.close(() => {
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('[Queue Service] SIGINT received. Shutting down...');
    await disconnectAll();
    server.close(() => {
        process.exit(0);
    });
});
