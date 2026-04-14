const express = require('express');
const router = express.Router();
const { updateWaitTime, getWaitTime } = require('../controllers/queue.controller');

router.post('/update', updateWaitTime);
router.get('/:serviceType/:serviceId', getWaitTime);

module.exports = router;
