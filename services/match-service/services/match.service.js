const { publishMatchEvent } = require('../producers/match.producer');

exports.processEvent = async (type, player, detail) => {
  if (!type) throw new Error('Event type required');

  const eventPayload = {
    type,
    player: player || 'Unknown',
    detail: detail || '',
    timestamp: new Date().toISOString()
  };

  await publishMatchEvent(eventPayload);
  return eventPayload;
};
