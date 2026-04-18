require('dotenv').config();
const { getProducer, getConsumer, ensureTopics } = require('../shared/utils/kafka.util');

async function testKafka() {
  const topic = 'test_topic';
  const message = { hello: 'world', timestamp: new Date().toISOString() };

  console.log('--- Kafka Integration Test ---');

  try {
    // 1. Ensure topics
    console.log('[Test] Ensuring topic exists...');
    await ensureTopics([topic]);

    // 2. Start Consumer
    console.log('[Test] Starting consumer...');
    const consumer = await getConsumer('test-group');
    await consumer.subscribe({ topic, fromBeginning: true });

    let messageReceived = false;
    consumer.run({
      eachMessage: async ({ topic: t, message: m }) => {
        const value = m.value.toString();
        console.log(`[Test] Received message: ${value}`);
        if (JSON.parse(value).hello === 'world') {
          messageReceived = true;
        }
      },
    });

    // 3. Start Producer
    console.log('[Test] Starting producer...');
    const producer = await getProducer();
    
    // 4. Send Message
    console.log('[Test] Sending message...');
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    console.log('[Test] Message sent successfully');

    // 5. Wait for consumption (timeout after 10s)
    let attempts = 0;
    while (!messageReceived && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }

    if (messageReceived) {
      console.log('✅ Kafka Integration Test PASSED');
    } else {
      console.error('❌ Kafka Integration Test FAILED (Timeout)');
    }

    // Cleanup
    await consumer.disconnect();
    await (await getProducer()).disconnect();
    process.exit(messageReceived ? 0 : 1);

  } catch (err) {
    console.error('❌ Kafka Integration Test ERROR:', err.message);
    process.exit(1);
  }
}

testKafka();
