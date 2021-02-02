const express = require('express');

const checkToken = require('../helper/checkToken');
const member = require('../controller/member');

const router = express.Router();

router.get('/group/:groupId', checkToken, member.getList);
router.delete('/:userId/group/:groupId', checkToken, member.remove);
// ajouter addmemeber route from routes/group

module.exports = router;
