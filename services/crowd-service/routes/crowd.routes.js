const express = require('express');
const router = express.Router();
const { updateCrowdDensity, getCrowdDensity } = require('../controllers/crowd.controller');

router.post('/update', updateCrowdDensity);
router.get('/:locationType/:locationId', getCrowdDensity);

module.exports = router;
