const { Kafka, Partitioners } = require('kafkajs');

class KafkaClient {
  constructor(clientId) {
    this.clientId = clientId;
    const isDocker = process.env.DOCKER_ENV === 'true';
    let rawBrokers = process.env.KAFKA_BROKERS || 'localhost:9092';
    
    // Smart fallback: If brokers contain "kafka:29092" but we aren't in Docker, use localhost:9092
    if (rawBrokers.includes('kafka:29092') && !isDocker) {
      rawBrokers = rawBrokers.replace('kafka:29092', 'localhost:9092');
      console.log('[Kafka] Running outside Docker, falling back to localhost:9092');
    }

    this.kafka = new Kafka({
      clientId: clientId,
      brokers: rawBrokers.split(','),
      retry: {
        initialRetryTime: 300,
        retries: 5
      }
    });
    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner
    });
    this.consumer = null;
  }

  async connectProducer() {
    await this.producer.connect();
    console.log(`[Kafka] Producer connected for ${this.clientId}`);
  }

  async publish(topic, messages) {
    try {
      const msgsArray = Array.isArray(messages) ? messages : [messages];
      const formattedMessages = msgsArray.map(msg => {
        if (msg && msg.value !== undefined) return msg;
        return { value: typeof msg === 'string' ? msg : JSON.stringify(msg) };
      });

      await this.producer.send({
        topic,
        messages: formattedMessages
      });
    } catch (err) {
      console.error(`[Kafka] Failed to publish to topic ${topic}:`, err);
    }
  }

  async connectConsumer(groupId, topics, onMessage) {
    this.consumer = this.kafka.consumer({ groupId });
    await this.consumer.connect();
    console.log(`[Kafka] Consumer connected for group ${groupId}`);

    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
    }

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const payload = JSON.parse(message.value.toString());
          await onMessage(topic, payload);
        } catch (err) {
          console.error(`[Kafka] Error processing message on topic ${topic}:`, err);
        }
      },
    });
  }
}

module.exports = KafkaClient;
