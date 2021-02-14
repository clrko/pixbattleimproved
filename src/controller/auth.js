const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { jwtSecret } = require('../../config');
const { decrypt } = require('../helper/encryptionCode');
const { checkIfEmailExist, checkIfIsAlreadyInGroup } = require('../models/auth');
const { addUserToGroup, addUserToBattle } = require('../models/member');
const { getBattleWithStatusPost } = require('../models/battle');

module.exports = {
  async authenticate(req, res, next) {
    try {
      // Check if the email exist and get the user information if so
      const stats = await checkIfEmailExist(req.body.email);
      if (stats.length === 0) {
        return res.status(401).send('The password or username is wrong');
      }

      const { user_id: userId, username, avatar_url: avatar, email: userEmail, password } = stats[0];

      // Check if the passwords match
      const myPlaintextPassword = req.body.password;
      const passwordMatch = await bcrypt.compare(myPlaintextPassword, password);
      if (!passwordMatch) {
        return res.sendStatus(401).send('The password or username is wrong');
      }

      // Check if user has received an invitation code in order to add him to the group and battle
      if (req.body.invitationCode) {
        const groupId = decrypt(req.body.invitationCode).substr(5);
        const isAlreadyInGroup = await checkIfIsAlreadyInGroup(userId, groupId);
        if (isAlreadyInGroup.length === 0) {
          await addUserToGroup(userId, groupId);
          const battleId = await getBattleWithStatusPost(groupId); // verifier ce qu'on reçoit
          await addUserToBattle([userId, battleId]);
        }
      }

      // Create the user token
      const tokenUserInfo = {
        userId: userId,
        username: username,
        avatar: avatar,
        userEmail: userEmail,
      };

      const token = jwt.sign(tokenUserInfo, jwtSecret);
      res.header('Access-Control-Expose-Headers', 'x-access-token');
      res.set('x-access-token', token);
      return res.status(200).send(tokenUserInfo);
    } catch (err) {
      next(err);
    }
  },
};
