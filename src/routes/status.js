const express = require('express');

const status = require('../controllers/status');

const checkKey = require('../helpers/checkKey');

const router = express.Router();

router.get('/', checkKey, status.getAndSendTotalCountOfBattles);

module.exports = router;
