const notificationService = require('../services/notification.service');
const { getConsumer, ensureTopics } = require('../../../shared/utils/kafka.util');

exports.startConsumer = async () => {
  try {
    console.log('[Notification Service] Initializing Kafka Consumer...');
    
    const topics = ['crowd_updates', 'queue_updates', 'match_events', 'alerts'];
    await ensureTopics(topics);

    const consumer = await getConsumer('notification-group');
    await consumer.subscribe({ topics, fromBeginning: false });

    console.log(`[Notification Service] Kafka Consumer connected and listening on: ${topics.join(', ')}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const payload = message.value.toString();
        console.log(`[Notification Service] Received message from Kafka topic: ${topic}`);
        
        try {
          const data = JSON.parse(payload);
          // Use the topic name as the channel for broadcasting
          notificationService.processAndBroadcast(topic, data);
        } catch (err) {
          console.error(`[Notification Service] Failed to process Kafka message on ${topic}:`, err.message);
        }
      },
    });

  } catch (e) {
    console.error('[Notification Service] Failed to start Kafka Consumer:', e.message);
  }
};