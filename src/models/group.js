const connection = require('../helpers/db');

module.exports = {
  async createNewGroup(adminId, groupName) {
    const sqlCreateGroup = 'INSERT INTO `group` (admin_user_id, group_name) VALUES (?, ?)';
    const values = [adminId, groupName];
    const stats = await connection.query(sqlCreateGroup, values);
    return stats.insertId;
  },

  async deleteGroup(groupId) {
    const sqlDeleteGroup = 'DELETE FROM `group` WHERE group_id = ?';
    const values = [groupId];
    await connection.query(sqlDeleteGroup, values);
  },

  async updateGroupName(newGroupName, groupId) {
    const sqlUpdateGroupName = 'UPDATE `group` SET group_name = ? WHERE group_id = ?';
    const insertValues = [newGroupName, groupId];
    await connection.query(sqlUpdateGroupName, insertValues);
  },

  async getGroupName(groupId) {
    const sqlSelectGroupName = 'SELECT group_name FROM `group` WHERE group_id = ?';
    const stats = await connection.query(sqlSelectGroupName, groupId);
    return stats;
  },

  async getUserGroups(userId) {
    const sqlGetGroupInformation = `SELECT
    gr.group_id,
    gr.group_name,
    gr.admin_user_id,
    SUM(CASE WHEN b.status_id = 1 OR b.status_id = 2 THEN 1 ELSE 0 END) AS ongoingBattles,
    SUM(CASE WHEN b.status_id = 3 THEN 1 ELSE 0 END) AS finishedBattles,
      gu.group_users AS groupMembers
    FROM \`group\` AS gr
    INNER JOIN battle AS b
      ON gr.group_id = b.group_id
    INNER JOIN (SELECT ug.group_id AS group_id, COUNT(ug.user_id) AS group_users FROM user_group AS ug GROUP BY ug.group_id) AS gu
      ON gu.group_id = gr.group_id
    WHERE gr.group_id IN (SELECT (ug.group_id) FROM user_group AS ug WHERE ug.user_id = ?)
    GROUP BY gr.group_id`;
    const stats = await connection.query(sqlGetGroupInformation, userId);
    return stats;
  },

  async getUserCountOfGroups(userId) {
    const sqlNumberGroupsUser = 'SELECT count(*) AS nb_groups FROM user_group WHERE user_id = ?';
    const userCountOfGroups = await connection.query(sqlNumberGroupsUser, userId);
    return userCountOfGroups;
  },

  async getGroupMembers(groupId) {
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

  async removeGroupMember(groupId, userId) {
    const sqlDeleteMember = 'DELETE FROM user_group WHERE group_id = ? AND user_id = ?';
    const deleteValues = [groupId, userId];
    await connection.query(sqlDeleteMember, deleteValues);
  },

  async addUserToGroup(userId, groupId) {
    const sqlGroupUser = 'INSERT INTO user_group VALUES (?, ?)';
    const insertValues = [userId, groupId];
    await connection.query(sqlGroupUser, insertValues);
  },
};
