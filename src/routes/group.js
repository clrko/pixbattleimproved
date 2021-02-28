const express = require('express');

const group = require('../controllers/group');

const checkToken = require('../helpers/checkToken');

const router = express.Router();

router.post('/', checkToken, group.createGroupAndSendInvitationEmail);
router.get('/my-groups', checkToken, group.getUserGroups);
router.delete('/:groupId', checkToken, group.deleteGroup);
router.put('/update/:groupId', checkToken, group.updateGroupName);
router.post('/add-members/:groupId', checkToken, group.inviteMembers);
router.get('/:groupId/member', checkToken, group.getGroupMembers);
router.delete('/:groupId/member/:userId', checkToken, group.removeFromGroup);
router.get('/:groupId/photos', checkToken, group.getAndSendAllGroupPhotos);
module.exports = router;
