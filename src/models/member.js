const connection = require('../helper/db');

module.exports = {
  async getList(groupId) {
    const sqlGetListMembers = `SELECT u.user_id, u.username, u.email, a.avatar_url
      FROM user AS u
      JOIN avatar AS a
        ON u.avatar_id = a.avatar_id
      JOIN user_group AS ug
        ON u.user_id = ug.user_id
      WHERE ug.group_id = ?`;
    const stats = connection.query(sqlGetListMembers, groupId);
    return stats;
  },

  async remove(groupId, userId) {
    const sqlDeleteMember = 'DELETE FROM user_group WHERE group_id = ? AND user_id = ?';
    const deleteValues = [groupId, userId];
    await connection.query(sqlDeleteMember, deleteValues);
  },

  async addUserToGroup(userId, groupId) {
    const sqlGroupUser = 'INSERT INTO user_group VALUES (?, ?)';
    const insertValues = [userId, groupId];
    await connection.query(sqlGroupUser, insertValues);
  },

  async addUserToBattle(userId, groupId) {
    const sqlInviteBattle =
      'INSERT INTO user_battle (user_id, battle_id) VALUES (?, (SELECT b.battle_id FROM battle AS b WHERE b.group_id = ? AND b.status_id = 1))';
    const valuesInviteBattle = [userId, groupId];
    connection.query(sqlInviteBattle, valuesInviteBattle);
  },
};
