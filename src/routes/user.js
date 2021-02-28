const express = require('express');

const user = require('../controllers/user');

const checkToken = require('../helpers/checkToken');

const router = express.Router();

router.get('/', checkToken, user.getAndSendUserProfileInformation);
router.get('/my-ranking', checkToken, user.getAndSendUserRankingInformation);
router.get('/avatars', checkToken, user.getAndSendAvatarList);
router.put('/settings/information', checkToken, user.updateUserInformationAndSendToken);
router.post('/registration', user.registerAndSendWelcomeEmail);
router.post('/authentication', user.authenticate);

module.exports = router;
