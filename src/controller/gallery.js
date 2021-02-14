const { getAllBattlePhotos, getAllGroupPhotos } = require('../models/photo');

module.exports = {
  async getAndSendAllBattlePhotos(req, res, next) {
    try {
      const battleId = [req.params.battleId];
      const photosBattleUrls = await getAllBattlePhotos(battleId);
      return res.status(200).send(photosBattleUrls);
    } catch (err) {
      next(err);
    }
  },

  async getAndSendAllGroupPhotos(req, res, next) {
    try {
      const groupId = [req.params.groupId];
      const photosGroupUrls = await getAllGroupPhotos(groupId);
      return res.status(200).send(photosGroupUrls);
    } catch (err) {
      next(err);
    }
  },
};
