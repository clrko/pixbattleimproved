const express = require('express');

const group = require('../controller/group');
const checkToken = require('../helper/checkToken');

const router = express.Router();

router.post('/', checkToken, group.create);
router.get('/my-groups', checkToken, group.retrieve);
router.delete('/:groupId', checkToken, group.remove);
router.put('/update/:groupId', checkToken, group.updateName);
router.post('/add-members/:groupId', checkToken, group.inviteMembers);

module.exports = router;
