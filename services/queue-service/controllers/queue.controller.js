const queueService = require('../services/queue.service');

exports.updateWaitTime = async (req, res) => {
  try {
    const { serviceType, serviceId, addedTimeMs, resolvedTimeMs } = req.body;
    
    if (!serviceType || !serviceId) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    const currentWait = await queueService.updateQueue(serviceType, serviceId, addedTimeMs, resolvedTimeMs);
    res.status(200).json({ serviceId, currentWait });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getWaitTime = async (req, res) => {
  try {
    const { serviceType, serviceId } = req.params;
    const estimatedWaitMs = await queueService.getQueue(serviceType, serviceId);
    res.status(200).json({ serviceId, estimatedWaitMs });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
};
