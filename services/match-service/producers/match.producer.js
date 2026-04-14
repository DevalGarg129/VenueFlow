let kafkaClient;

try {
  const KafkaClient = require('../../../shared/utils/kafka.util');
  kafkaClient = new KafkaClient('match-service-producer');
  kafkaClient.connectProducer().catch(console.error);
} catch (e) {
  console.error('[Match Service] Kafka connection setup failed:', e.message);
  kafkaClient = { publish: async () => {} };
}

exports.publishMatchEvent = async (eventPayload) => {
  if (kafkaClient) {
    await kafkaClient.publish('match_events', JSON.stringify(eventPayload));
  }
};
