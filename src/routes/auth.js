const express = require('express');

const auth = require('../controller/auth');

const router = express.Router();

router.post('/', auth.authenticate);

module.exports = router;
