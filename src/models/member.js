const connection = require('../helper/db');

module.exports = {
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

  async removeMember(groupId, userId) {
    const sqlDeleteMember = 'DELETE FROM user_group WHERE group_id = ? AND user_id = ?';
    const deleteValues = [groupId, userId];
    await connection.query(sqlDeleteMember, deleteValues);
  },

  async addUserToGroup(userId, groupId) {
    const sqlGroupUser = 'INSERT INTO user_group VALUES (?, ?)';
    const insertValues = [userId, groupId];
    await connection.query(sqlGroupUser, insertValues);
  },

  async addUserToBattle(userWithBattleId) {
    const sqlUserBattle = 'INSERT INTO user_battle VALUES ?';
    await connection.query(sqlUserBattle, userWithBattleId);
  },

  async getBattleParticipantListWithScores(battleId) {
    const sqlParticipantsList = `SELECT u.user_id, u.username, a.avatar_url, p.score
      FROM user AS u
      INNER JOIN avatar AS a
        ON u.avatar_id = a.avatar_id
      INNER JOIN user_battle AS ub
        ON ub.user_id = u.user_id
      LEFT JOIN photo AS p
        ON ub.user_id = p.user_id
      WHERE p.battle_id = ?
      GROUP BY u.user_id, p.score
      ORDER BY p.score DESC`;
    const battleParticipantListWithScores = await connection.query(sqlParticipantsList, battleId);
    return battleParticipantListWithScores;
  },

  async getBattleParticipantVictories(battleId) {
    const sqlVictoriesParticipants = `SELECT b.winner_user_id, COUNT(b.winner_user_id) AS victories
      FROM user AS u
      JOIN battle AS b
        ON b.winner_user_id = u.user_id
      JOIN user_battle AS ub
        ON ub.user_id = u.user_id
      JOIN battle AS ba
        ON ba.battle_id = ub.battle_id
      WHERE ba.battle_id = ?
      GROUP BY b.winner_user_id`;
    const battleParticipantVictories = await connection.query(sqlVictoriesParticipants, battleId);
    return battleParticipantVictories;
  },
};
