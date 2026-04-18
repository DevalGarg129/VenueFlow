const { Kafka, logLevel } = require('kafkajs');

const createKafkaClient = () => {
  const isDocker = process.env.DOCKER_ENV === 'true';
  let brokers = process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'];

  if (brokers.some(b => b.includes('kafka')) && !isDocker) {
    brokers = brokers.map(b => b.replace('kafka', 'localhost').replace('29092', '9092'));
    console.log('[Kafka] Running outside Docker, falling back to localhost brokers');
  } else if (isDocker && brokers.some(b => b.includes('localhost'))) {
    brokers = ['kafka:29092'];
    console.log('[Kafka] Running in Docker, using internal kafka service');
  }

  const kafkaConfig = {
    clientId: process.env.KAFKA_CLIENT_ID || 'arena-pulse',
    brokers,
    logLevel: logLevel.ERROR,
    retry: {
      initialRetryTime: 300,
      retries: 10
    }
  };

  if (process.env.KAFKA_USERNAME && process.env.KAFKA_PASSWORD) {
    kafkaConfig.ssl = true;
    kafkaConfig.sasl = {
      mechanism: 'scram-sha-256',
      username: process.env.KAFKA_USERNAME,
      password: process.env.KAFKA_PASSWORD,
    };
    console.log('[Kafka] SASL Auth configured');
  }

  return new Kafka(kafkaConfig);
};

let kafkaInstance = null;
const getKafka = () => {
  if (!kafkaInstance) {
    kafkaInstance = createKafkaClient();
  }
  return kafkaInstance;
};

let producerInstance = null;
const getProducer = async () => {
  if (!producerInstance) {
    try {
      const kafka = getKafka();
      producerInstance = kafka.producer();
      await producerInstance.connect();
      console.log('[Kafka] Producer connected successfully');
    } catch (err) {
      console.error('[Kafka] Producer connection error:', err.message);
      producerInstance = null;
      throw err;
    }
  }
  return producerInstance;
};

const getConsumer = async (groupId) => {
  try {
    const kafka = getKafka();
    const consumer = kafka.consumer({ groupId });
    await consumer.connect();
    console.log(`[Kafka] Consumer connected with group: ${groupId}`);
    return consumer;
  } catch (err) {
    console.error(`[Kafka] Consumer (${groupId}) connection error:`, err.message);
    throw err;
  }
};

const ensureTopics = async (topics) => {
  const kafka = getKafka();
  const admin = kafka.admin();
  try {
    await admin.connect();
    const existingTopics = await admin.listTopics();
    const topicsToCreate = topics
      .filter(topic => !existingTopics.includes(topic))
      .map(topic => ({
        topic,
        numPartitions: 1,
        replicationFactor: 1
      }));

    if (topicsToCreate.length > 0) {
      await admin.createTopics({
        topics: topicsToCreate,
        waitForLeaders: true
      });
      console.log(`[Kafka] Created topics: ${topicsToCreate.map(t => t.topic).join(', ')}`);
    }
  } catch (err) {
    console.warn('[Kafka] Failed to ensure topics exist:', err.message);
  } finally {
    await admin.disconnect();
  }
};

const disconnectAll = async () => {
  console.log('[Kafka] Disconnecting all Kafka clients...');
  if (producerInstance) {
    await producerInstance.disconnect();
    producerInstance = null;
  }
  console.log('[Kafka] All clients disconnected');
};

const healthCheck = async () => {
  const kafka = getKafka();
  const admin = kafka.admin();
  try {
    await admin.connect();
    await admin.listTopics();
    return { status: 'healthy', transport: 'kafka' };
  } catch (err) {
    return { status: 'unhealthy', transport: 'kafka', error: err.message };
  } finally {
    await admin.disconnect();
  }
};

module.exports = {
  getKafka,
  getProducer,
  getConsumer,
  ensureTopics,
  disconnectAll,
  healthCheck
};
