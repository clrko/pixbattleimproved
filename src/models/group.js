const connection = require('../helper/db');

module.exports = {
  async create(adminId, groupName) {
    const sqlCreateGroup = 'INSERT INTO `group` (admin_user_id, group_name) VALUES (?, ?)';
    const values = [adminId, groupName];
    const stats = await connection.query(sqlCreateGroup, values);
    return stats.insertId;
  },

  async addUser(adminId, groupId) {
    const sqlGroupUser = 'INSERT INTO user_group VALUES (?, ?)';
    const insertValues = [adminId, groupId];
    await connection.query(sqlGroupUser, insertValues);
  },

  async delete(groupId) {
    const sqlDeleteGroup = 'DELETE FROM `group` WHERE group_id = ?';
    const values = [groupId];
    await connection.query(sqlDeleteGroup, values);
  },

  async retrieve(userId) {
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

  async updateName(newGroupName, groupId) {
    const sql = 'UPDATE `group` SET group_name = ? WHERE group_id = ?';
    const insertValues = [newGroupName, groupId];
    await connection.query(sql, insertValues);
  },
};
