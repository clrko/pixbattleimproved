const connection = require('../helper/db');

module.exports = {
  async uploadPhoto(filename, userId, battleId, groupId) {
    const sqlInsertPhoto = 'INSERT INTO photo (photo_url, user_id, battle_id, group_id) VALUES (?, ?, ?, ?)';
    const valuesInsertPhoto = [filename, userId, battleId, groupId];
    const stats = await connection.query(sqlInsertPhoto, valuesInsertPhoto);
    return stats.insertId;
  },

  async updatePhoto(photoUrl, photoId) {
    const sqlUpdatePhoto = 'UPDATE photo SET photo_url = ? WHERE photo_id = ?';
    const valuesUpdatePhoto = [photoUrl, photoId];
    await connection.query(sqlUpdatePhoto, valuesUpdatePhoto);
  },
  async deletePhoto(photoId) {
    const sqlDeletePhoto = 'DELETE FROM photo WHERE photo_id = ?';
    const valueDeletePhoto = [photoId];
    await connection.query(sqlDeletePhoto, valueDeletePhoto);
  },

  async getBattlePhotosForVote(battleId, userId) {
    const sqlPhotosBattle = `SELECT * FROM photo AS p
            JOIN battle AS b
            ON b.battle_id = p.battle_id
            WHERE b.battle_id = ?
            AND NOT p.user_id = ?`;
    const values = [battleId, userId];
    const photos = await connection.query(sqlPhotosBattle, values);
    return photos;
  },

  async insertUserVotes(votes) {
    const sqlPostVote = `INSERT INTO user_photo
            (user_id, photo_id, vote)
            VALUES
            (?, ?, ?),
            (?, ?, ?),
            (?, ?, ?)`;
    await connection.query(sqlPostVote, votes);
  },

  async getBattleUsersWithPhotos(battleId) {
    const sqlGetUsers = `SELECT u.username, a.avatar_url, up.vote, up.photo_id, p.*
            FROM avatar AS a
            JOIN user AS u
                ON u.avatar_id = a.avatar_id
            JOIN user_photo AS up
                ON up.user_id = u.user_id
            JOIN photo AS p
                ON p.photo_id = up.photo_id
            WHERE p.battle_id = ?`;
    const battlePhotos = await connection.query(sqlGetUsers, battleId);
    return battlePhotos;
  },

  async getAllBattlePhotos(battleId) {
    const sqlPhotosBattle =
      'SELECT * FROM photo AS p JOIN battle AS b ON b.battle_id = p.battle_id WHERE b.battle_id = ?';
    const battlePhotos = connection.query(sqlPhotosBattle, battleId);
    return battlePhotos;
  },

  async getAllGroupPhotos(groupId) {
    const sqlPhotosGroup =
      'SELECT  * FROM photo AS p JOIN `group` AS g ON g.group_id = p.group_id WHERE g.group_id = ?';
    const groupPhotos = connection.query(sqlPhotosGroup, groupId);
    return groupPhotos;
  },

  async getUserCountOfPhotos(userId) {
    const sqlUserCountPhotos = 'SELECT count(*) AS nb_photos FROM photo WHERE user_id = ?';
    const userCountOfPhotos = await connection.query(sqlUserCountPhotos, userId);
    return userCountOfPhotos;
  },
};
