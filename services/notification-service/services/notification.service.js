const { broadcastEvent } = require('../sockets/notification.socket');

exports.processAndBroadcast = (topic, message) => {
  try {
    const payload = typeof message === 'string' ? JSON.parse(message) : message;
    
    // Additional validation or formatting logic can go here.
    // E.g., formatting timestamp, injecting global venue ids, etc.
    if (!payload.timestamp) {
        payload.timestamp = new Date().toISOString();
    }

    // Push via Socket.io
    broadcastEvent(topic, payload);
    return payload;

  } catch (err) {
    console.error(`[Notification Service] Failed to process message on topic: ${topic}`, err);
    throw err;
  }
};
