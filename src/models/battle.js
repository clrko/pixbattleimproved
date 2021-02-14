const connection = require('../helper/db');

module.exports = {
  async getThemeList() {
    const sql = 'SELECT * FROM theme ORDER BY RAND() LIMIT 10;';
    const themes = await connection.query(sql);
    return themes;
  },

  async getRuleList() {
    const sql = 'SELECT * FROM rule;';
    const rules = await connection.query(sql);
    return rules;
  },

  async createNewBattle(deadline, groupId, themeId, userId) {
    const sql = 'INSERT INTO battle (deadline, group_id, theme_id, admin_user_id, status_id) VALUES (?, ?, ?, ?, 1)';
    const value = [deadline, groupId, themeId, userId];
    const stats = await connection.query(sql, value);
    return stats.insertId;
  },

  async insertBattleRules(battleRules) {
    const sqlBattleRule = 'INSERT INTO battle_rule VALUES ?';
    await connection.query(sqlBattleRule, [battleRules]);
  },

  async getBattleWithStatusPost(groupId) {
    const sqlBattlePostStatus = 'SELECT b.battle_id FROM battle AS b WHERE b.group_id = ? AND b.status_id = 1';
    const stats = await connection.query(sqlBattlePostStatus, groupId);
    return stats[0];
  },

  async getBattleMemberUploadStatus(battleId) {
    const sqlBattlePostStatus = `SELECT u.user_id, u.username, a.avatar_url, SUM(CASE WHEN p.battle_id = ? THEN 1 ELSE 0 END) AS posted
        FROM avatar AS a
        INNER JOIN user AS u
          ON u.avatar_id = a.avatar_id
        INNER JOIN user_battle AS ub
          ON ub.user_id = u.user_id
        LEFT JOIN photo AS p
          ON u.user_id = p.user_id
        WHERE ub.battle_id = ?
        GROUP BY u.user_id;`;
    const stats = await connection.query(sqlBattlePostStatus, [battleId, battleId]);
    return stats;
  },

  async getUserPostedPhotoInformation(userId, queryId) {
    const sql = `SELECT *
            FROM photo AS p
            WHERE p.user_id = ?
            AND p.battle_id IN(?)`;
    const values = [userId, queryId];
    const stats = await connection.query(sql, values);
    return stats;
  },

  async getBattleInformation(battleId) {
    const sqlBattleInfos = `SELECT t.theme_name, b.deadline, r.rule_name
            FROM theme AS t
            JOIN battle AS b
                ON b.theme_id = t.theme_id
            JOIN battle_rule AS br
                ON br.battle_id = b.battle_id
            JOIN rule AS r
                ON r.rule_id = br.rule_id
            WHERE b.battle_id = ?`;
    const valueBattleId = [battleId];
    const battleInfos = await connection.query(sqlBattleInfos, valueBattleId);
    return battleInfos;
  },

  async getBattleVoteStatus(battleId) {
    const sqlBattleVoteStatus = `SELECT DISTINCT u.user_id, u.username, a.avatar_url, SUM(CASE WHEN up.photo_id IN (SELECT p.photo_id FROM photo AS p WHERE p.battle_id = ?) THEN 1 ELSE 0 END) AS voted
            FROM user AS u
            INNER JOIN avatar AS a
            ON u.avatar_id = a.avatar_id
            INNER JOIN user_battle AS ub
            ON ub.user_id = u.user_id
            LEFT JOIN user_photo AS up
            ON u.user_id = up.user_id
            WHERE ub.battle_id = ?
            GROUP BY u.user_id`;
    const battleVoteStatus = await connection.query(sqlBattleVoteStatus, [battleId, battleId]);
    return battleVoteStatus;
  },

  async getUserVoteStatus(userId, battleId) {
    const sql = `SELECT p.photo_id, p.photo_url, up.vote
            FROM user_photo AS up
            JOIN photo AS p
            ON p.photo_id = up.photo_id
            WHERE up.user_id = ?
            AND p.battle_id = ?`;
    const values = [userId, battleId];
    const userVoteStatus = await connection.query(sql, values);
    return userVoteStatus;
  },

  async getUserAllBattlesInformation(userId) {
    const sqlGetBattleInformation = `SELECT b.battle_id, t.theme_name, b.deadline, b.create_date, b.admin_user_id, gr.group_name, gr.group_id, st.status_name
            FROM battle AS b
            JOIN theme AS t
                ON b.theme_id = t.theme_id
            JOIN \`group\` AS gr
                ON b.group_id = gr.group_id
            JOIN \`status\` AS st
                ON b.status_id = st.status_id
            JOIN user_battle AS ub
                ON b.battle_id = ub.battle_id
            WHERE ub.user_id = ?`;
    const userBattleInformation = await connection.query(sqlGetBattleInformation, userId);
    return userBattleInformation;
  },

  async getUserGroupBattlesInformation(userId, groupId) {
    const sqlGetBattleInformation = `SELECT b.battle_id, t.theme_name, b.deadline, b.create_date, b.admin_user_id, gr.group_name, gr.group_id, st.status_name
            FROM battle AS b
            JOIN theme AS t
            ON b.theme_id = t.theme_id
            JOIN \`group\` AS gr
            ON b.group_id = gr.group_id
            JOIN \`status\` AS st
            ON b.status_id = st.status_id
            JOIN user_battle AS ub
            ON b.battle_id = ub.battle_id
            WHERE ub.user_id = ? AND b.group_id = ?`;
    const sqlGetBattleInformationValues = [userId, groupId];
    const userGroupBattleInformation = await connection.query(sqlGetBattleInformation, sqlGetBattleInformationValues);
    return userGroupBattleInformation;
  },

  async getPendingGroupBattle(groupId) {
    const sqlGetPendingBattleGroup = `SELECT battle_id, status_id
            FROM battle
            WHERE group_id = ?
            AND status_id != 3`;
    const pendingBattle = await connection.query(sqlGetPendingBattleGroup, groupId);
    return pendingBattle;
  },
};
