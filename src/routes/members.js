const express = require('express');
const router = express.Router();

const checkToken = require('../helper/checkToken');
const member = require('../controller/member');

router.get('/group/:groupId', checkToken, member.getList);
router.delete('/:userId/group/:groupId', checkToken, member.remove);
// ajouter addUser and change to add member

module.exports = router;
