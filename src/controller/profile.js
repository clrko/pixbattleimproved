const jwt = require('jsonwebtoken');

const { jwtSecret } = require('../../config');
const { getUserCountOfVictories, getUserCountOfBattles, getUserRanking } = require('../models/battle');
const { getUserCountOfGroups } = require('../models/group');
const { getUserCountOfPhotos } = require('../models/photo');
const { getAvatars, updateUserInformation } = require('../models/profile');

module.exports = {
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
      const username = req.body.newUsername;
      const valuesToUpdate = { avatar_id: avatarId };
      if (username) {
        valuesToUpdate.username = username;
      }
      await updateUserInformation(valuesToUpdate, userId);
      const tokenUserInfo = {
        userId: req.user.userId,
        username: username,
        avatar: req.body.selectedAvatarUrl,
        userEmail: req.user.userEmail,
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
