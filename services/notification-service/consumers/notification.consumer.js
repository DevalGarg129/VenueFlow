const notificationService = require('../services/notification.service');

exports.startConsumer = async () => {
  try {
    const KafkaClient = require('../../../shared/utils/kafka.util');
    const kafkaClient = new KafkaClient('notification-service');

    await kafkaClient.connectConsumer(
      'notification-group',
      ['crowd_updates', 'queue_updates', 'match_events', 'alerts'],
      async (topic, message) => {
        console.log(`[Notification Service] Received on ${topic}`);
        notificationService.processAndBroadcast(topic, message);
      }
    );
  } catch (e) {
    console.log('[Notification Service] Working without Kafka attached. Error: ', e.message);
  }
};