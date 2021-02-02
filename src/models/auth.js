const connection = require('../helper/db');

module.exports = {
  async checkIfEmailExist(email) {
    const sql =
      'SELECT u.user_id, u.username, u.email, u.password, a.avatar_url FROM user AS u JOIN avatar AS a ON u.avatar_id = a.avatar_id WHERE email = ?';
    const values = [email];
    const stats = await connection.query(sql, values);
    return stats;
  },

  async checkIfIsAlreadyInGroup(userId, groupId) {
    const sqlInviteCheck = 'SELECT user_id, group_id FROM user_group WHERE user_id = ? AND group_id = ?';
    const valuesInvite = [userId, groupId];
    const stats = await connection.query(sqlInviteCheck, valuesInvite);
    return stats;
  },
};
