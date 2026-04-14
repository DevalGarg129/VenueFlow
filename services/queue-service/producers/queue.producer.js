let kafkaClient;

try {
  const KafkaClient = require('../../../../shared/utils/kafka.util');
  kafkaClient = new KafkaClient('queue-service-producer');
  kafkaClient.connectProducer().catch(console.error);
} catch (e) {
  kafkaClient = { publish: async () => console.log('Mock Publish') };
}

exports.publishQueueUpdate = async (topic, payload) => {
  await kafkaClient.publish(topic, JSON.stringify(payload));
};
