const connection = require('../helper/db');

module.exports = {
  getAvatars() {
    const sql = 'SELECT * FROM avatar';
    const avatars = connection.query(sql);
    return avatars;
  },

  createNewUser(username, email, hash) {
    const sql = 'INSERT INTO user(username, email, password, avatar_id) VALUES(?, ?, ?, 1)';
    const valueToInsert = [username, email, hash];
    connection.query(sql, valueToInsert);
  },

  updateUserInformation(valuesToUpdate, userId) {
    const sqlToUpdate = `UPDATE user
            SET ?
            WHERE user_id = ?`;
    connection.query(sqlToUpdate, [valuesToUpdate, userId]);
  },

  getUserInformation(email) {
    const sql =
      'SELECT user_id, username, email, a.avatar_url FROM user JOIN avatar AS a ON user.avatar_id = a.avatar_id  WHERE email = ?';
    connection.query(sql, email);
  },

  checkIfEmailExist(email) {
    const sql =
      'SELECT u.user_id, u.username, u.email, u.password, a.avatar_url FROM user AS u JOIN avatar AS a ON u.avatar_id = a.avatar_id WHERE email = ?';
    const values = [email];
    const stats = connection.query(sql, values);
    return stats;
  },

  checkIfIsAlreadyInGroup(userId, groupId) {
    const sqlInviteCheck = 'SELECT user_id, group_id FROM user_group WHERE user_id = ? AND group_id = ?';
    const valuesInvite = [userId, groupId];
    const stats = connection.query(sqlInviteCheck, valuesInvite);
    return stats;
  },
};
