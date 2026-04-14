const express = require('express');
const router = express.Router();
const { triggerEvent } = require('../controllers/match.controller');

router.post('/event', triggerEvent);

module.exports = router;
