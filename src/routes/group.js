const express = require('express');

const group = require('../controller/group');
const checkToken = require('../helper/checkToken');

const router = express.Router();

router.post('/', checkToken, group.createGroupAndSendEmail);
router.get('/my-groups', checkToken, group.getUserGroups);
router.delete('/:groupId', checkToken, group.deleteGroup);
router.put('/update/:groupId', checkToken, group.updateName);
router.post('/add-members/:groupId', checkToken, group.inviteMembers);
router.get('/:groupId/member', checkToken, group.getGroupMembers);
router.delete('/:groupId/member/:userId', checkToken, group.removeGroupMember);
router.get('/:groupId/photos', checkToken, group.getAndSendAllGroupPhotos);
module.exports = router;
