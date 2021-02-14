const express = require('express');
const router = express.Router();

const checkToken = require('../helper/checkToken');
const { profile } = require('../controller/profile');

router.get('/', checkToken, profile.getAndSendUserProfileInformation);
router.get('/my-ranking', checkToken, profile.getAndSendUserRankingInformation);
router.get('/avatars', checkToken, profile.getAndSendAvatarList);
router.put('/settings/informations', checkToken, profile.updateUserInformationAndSendToken);

module.exports = router;
