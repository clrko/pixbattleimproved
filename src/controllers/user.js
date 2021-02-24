const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { jwtSecret } = require('../../config');

const { decrypt } = require('../helpers/encryptionCode');
const { sendWelcomeMail } = require('../helpers/sendInvitationMail');

const {
  checkIfEmailExist,
  checkIfIsAlreadyInGroup,
  getAvatars,
  updateUserInformation,
  getUserInformation,
  createNewUser,
} = require('../models/user');

const {
  getBattleWithStatusPost,
  addUserToBattle,
  getUserCountOfVictories,
  getUserCountOfBattles,
  getUserRanking,
} = require('../models/battle');

const { getUserCountOfGroups, addUserToGroup } = require('../models/group');

const { getUserCountOfPhotos } = require('../models/photo');

const addUserToGroupAndBattleWithInviationCode = async (invitationCode, userId) => {
  const groupId = decrypt(invitationCode).substr(5);
  const isAlreadyInGroup = await checkIfIsAlreadyInGroup(userId, groupId);
  if (isAlreadyInGroup.length === 0) {
    await addUserToGroup(userId, groupId);
    const battleId = await getBattleWithStatusPost(groupId); // verifier ce qu'on reçoit
    await addUserToBattle([userId, battleId]);
  }
};

const createToken = (userId, username, avatar, userEmail) => {
  const tokenUserInfo = {
    userId,
    username,
    avatar,
    userEmail,
  };
  const token = jwt.sign(tokenUserInfo, jwtSecret);
  return { token, tokenUserInfo };
};

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

      if (req.body.invitationCode) {
        await addUserToGroupAndBattleWithInviationCode(req.body.invitationCode, userId);
      }

      const { token, tokenUserInfo } = createToken(userId, username, avatar, userEmail);
      res.header('Access-Control-Expose-Headers', 'x-access-token');
      res.set('x-access-token', token);

      return res.status(200).send(tokenUserInfo);
    } catch (err) {
      next(err);
    }
  },

  async registerAndSendWelcomeEmail(req, res, next) {
    try {
      const { email, password, username } = req.body;

      const result = await checkIfEmailExist(email);

      // User already registered
      if (result[0].email && result[0].username) {
        return res.sendStatus(409);
      }

      // User not registered
      const saltRounds = 10;
      const myPlaintextPassword = password;
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(myPlaintextPassword, salt);
      createNewUser(username, email, hash);
      const userInformation = getUserInformation(email);
      const { user_id: userId, avatar_url: avatar } = userInformation;
      if (req.body.invitationCode) {
        addUserToGroupAndBattleWithInviationCode(req.body.invitationCode, userId);
      }

      const { token, tokenUserInfo } = createToken(userId, username, avatar, email);
      res.header('Access-Control-Expose-Headers', 'x-access-token');
      res.set('x-access-token', token);

      sendWelcomeMail(email, username);

      return res.status(200).send(tokenUserInfo);
    } catch (err) {
      next(err);
    }
  },

  async getAndSendUserProfileInformation(res, req, next) {
    try {
      const { userId } = req.user;
      const userCountOfVictories = await getUserCountOfVictories(userId);
      const userCountOfPhotos = await getUserCountOfPhotos(userId);
      const userCountOfGroups = await getUserCountOfGroups(userId);
      const userCountOfBattles = await getUserCountOfBattles(userId);

      const allInfos = {
        userCountOfVictories,
        userCountOfPhotos,
        userCountOfGroups,
        userCountOfBattles,
      };
      return res.status(200).send(allInfos);
    } catch (err) {
      next(err);
    }
  },

  async getAndSendUserRankingInformation(req, res, next) {
    try {
      const { userId } = req.user;
      const userRanking = await getUserRanking(userId);
      return res.status(200).send(userRanking);
    } catch (err) {
      next(err);
    }
  },

  async getAndSendAvatarList(req, res, next) {
    try {
      const avatars = await getAvatars();
      return res.status(200).send(avatars);
    } catch (err) {
      next(err);
    }
  },

  async updateUserInformationAndSendToken(req, res, next) {
    try {
      const userId = req.user.userId;
      const avatarId = req.body.selectedAvatar;
      const avatarUrl = req.body.selectedAvatarUrl;
      const username = req.body.newUsername;
      const email = req.user.userEmail;
      const valuesToUpdate = { avatar_id: avatarId };
      if (username) {
        valuesToUpdate.username = username;
      }
      updateUserInformation(valuesToUpdate, userId);

      const { token, tokenUserInfo } = createToken(userId, username, avatarUrl, email);
      res.header('Access-Control-Expose-Headers', 'x-access-token');
      res.set('x-access-token', token);
      return res.status(200).send(tokenUserInfo);
    } catch (err) {
      next(err);
    }
  },
};
