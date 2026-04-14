const matchService = require('../services/match.service');

exports.triggerEvent = async (req, res) => {
  try {
    const { type, player, detail } = req.body;
    const eventPayload = await matchService.processEvent(type, player, detail);
    res.status(200).json({ message: 'Event emitted', eventPayload });
  } catch(err) {
    res.status(400).json({ message: err.message });
  }
};
