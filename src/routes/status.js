const express = require('express');
const router = express.Router();

const { checkKey } = require('../helper/checkKey');
const { status } = require('../controller/status');

router.get('/', checkKey, status.getAndSendTotalCountOfBattles);

module.exports = router;
