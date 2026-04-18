const { getProducer, ensureTopics } = require('../../../shared/utils/kafka.util');

// Ensure the topic exists
ensureTopics(['match_events']);

exports.processEvent = async (type, player, detail, time) => {
  if (!type) throw new Error('Event type required');

  const eventPayload = {
    id: Date.now(),
    type,
    player: player || 'Unknown',
    detail: detail || '',
    time: time || '43.1',
    timestamp: new Date().toISOString()
  };

  try {
    const producer = await getProducer();
    await producer.send({
      topic: 'match_events',
      messages: [
        { value: JSON.stringify(eventPayload) }
      ],
    });
    console.log(`[Match Service] Event published to Kafka: ${type}`);
  } catch (err) {
    console.error('[Match Service] Failed to publish match event to Kafka:', err.message);
  }

  return eventPayload;
};
