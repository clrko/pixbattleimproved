const express = require('express');
const router = express.Router();

const checkToken = require('../helper/checkToken');
const { gallery } = require('../controller/gallery');

router.get('/battle/:battleId', checkToken, gallery.getAndSendAllBattlePhotos);
router.get('/group/:groupId', checkToken, gallery.getAndSendAllGroupPhotos);

module.exports = router;
