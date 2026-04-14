const { publishMatchEvent } = require('../producers/match.producer');

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

  await publishMatchEvent(eventPayload);
  return eventPayload;
};
