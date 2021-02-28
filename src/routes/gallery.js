const express = require('express');

const connection = require('../helpers/db');
const checkToken = require('../helpers/checkToken');

const router = express.Router();

router.get('/battle/:battleId', (req, res, next) => {
  const sqlPhotosBattle =
    'SELECT * FROM photo AS p JOIN battle AS b ON b.battle_id = p.battle_id WHERE b.battle_id = ?';
  const battleId = [req.params.battleId];
  connection.query(sqlPhotosBattle, battleId, (err, photosBattleUrls) => {
    if (err) return next(err);
    res.status(200).send(photosBattleUrls);
  });
});

router.get('/group/:groupId', (req, res, next) => {
  const sqlPhotosGroup = 'SELECT  * FROM photo AS p JOIN `group` AS g ON g.group_id = p.group_id WHERE g.group_id = ?';
  const groupId = [req.params.groupId];
  connection.query(sqlPhotosGroup, groupId, (err, photosGroupUrls) => {
    if (err) return next(err);
    res.status(200).send(photosGroupUrls);
  });
});

router.get('/user', checkToken, (req, res, next) => {
  const sqlPhotosUser = `SELECT u.username, a.avatar_url, p.*
    FROM avatar AS a
    JOIN user AS u
      ON u.avatar_id = a.avatar_id
    JOIN photo AS p
      ON p.user_id = u.user_id
    WHERE p.user_id = ?`;
  const userId = [req.user.userId];
  connection.query(sqlPhotosUser, userId, (err, photosUserUrls) => {
    if (err) return next(err);
    const sqlUserVotes = `SELECT u.username, a.avatar_url, up.vote, up.photo_id
    FROM avatar AS a
    JOIN user AS u
      ON u.avatar_id = a.avatar_id
    JOIN user_photo AS up
      ON up.user_id = u.user_id
    JOIN photo AS p
      ON p.photo_id = up.photo_id
    WHERE p.user_id = ?`;
    connection.query(sqlUserVotes, userId, (err, userVoteInfos) => {
      if (err) return next(err);
      const infosPhotosUser = {
        photosUserUrls,
        userVoteInfos,
      };
      res.status(200).send(infosPhotosUser);
    });
  });
});

module.exports = router;
