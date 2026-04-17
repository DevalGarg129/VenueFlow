const notificationService = require('../services/notification.service');
const createRedisClient = require('../../../shared/utils/redis.util');

exports.startConsumer = async () => {
  try {
    console.log('[Notification Service] Initializing Redis Subscriber...');
    const subscriber = createRedisClient();

    // Subscribe to relevant channels
    const channels = ['crowd_updates', 'queue_updates', 'match-events', 'alerts'];
    await subscriber.subscribe(...channels);

    console.log(`[Notification Service] Redis Subscriber connected and listening on: ${channels.join(', ')}`);

    subscriber.on('message', (channel, message) => {
      console.log(`[Notification Service] Received message on channel: ${channel}`);
      
      try {
        const data = JSON.parse(message);
        
        // Specific requirement: match-events -> match-update
        if (channel === 'match-events') {
          const { broadcastEvent } = require('../sockets/notification.socket');
          broadcastEvent('match-update', data);
        } else {
          // Other channels follow existing logic
          notificationService.processAndBroadcast(channel, data);
        }
      } catch (err) {
        console.error(`[Notification Service] Failed to process Redis message on ${channel}:`, err.message);
      }
    });

    subscriber.on('error', (err) => {
      console.error('[Notification Service] Redis Subscriber Error:', err.message);
    });

  } catch (e) {
    console.error('[Notification Service] Failed to start Redis Subscriber:', e.message);
  }
};