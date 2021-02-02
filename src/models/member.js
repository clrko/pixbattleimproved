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
};
