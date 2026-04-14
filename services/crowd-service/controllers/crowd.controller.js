const crowdService = require('../services/crowd.service');

exports.updateCrowdDensity = async (req, res) => {
  try {
    const { locationType, locationId, count, action } = req.body;

    if (!locationType || !locationId || count === undefined) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    const currentDensity = await crowdService.updateDensity(locationType, locationId, count, action);
    res.status(200).json({ locationId, currentDensity });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCrowdDensity = async (req, res) => {
  try {
    const { locationType, locationId } = req.params;
    const density = await crowdService.getDensity(locationType, locationId);
    res.status(200).json({ locationId, density });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
};
