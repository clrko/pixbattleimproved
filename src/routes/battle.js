const express = require('express');

const battle = require('../controllers/battle');

const checkToken = require('../helpers/checkToken');
const { upload } = require('../helpers/uploadPhoto');

const router = express.Router();

// Battle Creation
router.get('/battle-creation/themes', checkToken, battle.getAndSendThemeList);
router.get('/battle-creation/rules', checkToken, battle.getAndSendRuleList);
router.post('/battle-creation', checkToken, battle.createNewBattleAndNotifyUsers);

// Battle Post
router.get('/battle-post/:battleId/members', checkToken, battle.getAndSendBattleMemberUploadStatus);
router.get('/battle-post/status-user', checkToken, battle.getAndSendUserPostedPhoto);
router.get('/battle-post/:groupId/:battleId', checkToken, battle.getAndSendUserBattlePostInformation);
router.post('/battle-post/addpicture', checkToken, upload.single('file'), battle.uploadPhotoAndSendId);
router.put('/battle-post/:photoId', checkToken, battle.updatePhoto);
router.delete('/battle-post', checkToken, battle.deletePhoto);

// Battle Vote
router.get('/battle-vote/:battleId', checkToken, battle.getAndSendPhotosToVote);
router.get('/battle-vote/:battleId/members', checkToken, battle.getAndSendBattleVoteStatus);
router.get('/battle-vote/:battleId/status-user', checkToken, battle.getAndSendUserVoteStatus);
router.post('/battle-vote', checkToken, battle.insertUserVotes);

// Battle Results
router.get('/:battleId/results', checkToken, battle.getAndSendParticipantBattleResults); // route to be changed to battle-results
router.get('/battle-results/:battleId/photos', checkToken, battle.getAndSendPhotoBattleResults);

// Battle General information
router.get('/my-battles', checkToken, battle.getAndSendUserAllBattles);
router.get('/my-battles/:groupId', checkToken, battle.getAndSendUserGroupBattles);
router.get('/my-battles/:groupId/pending', checkToken, battle.getAndSendPendingGroupBattle);
router.get('/:battleId/photos', checkToken, battle.getAndSendAllBattlePhotos);

module.exports = router;
