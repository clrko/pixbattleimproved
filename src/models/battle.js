const connection = require('../helpers/db');

exports.getThemeList = async () => {
  const sql = 'SELECT * FROM theme ORDER BY RAND() LIMIT 10;';
  const themes = connection.query(sql);
  return themes;
};

exports.getRuleList = async () => {
  const sql = 'SELECT * FROM rule;';
  const rules = connection.query(sql);
  return rules;
};

exports.createNewBattle = async (deadline, groupId, themeId, userId) => {
  const sql = 'INSERT INTO battle (deadline, group_id, theme_id, admin_user_id, status_id) VALUES (?, ?, ?, ?, 1)';
  const value = [deadline, groupId, themeId, userId];
  const stats = connection.query(sql, value);
  return stats.insertId;
};

exports.insertBattleRules = async (battleRules) => {
  const sqlBattleRule = 'INSERT INTO battle_rule VALUES ?';
  connection.query(sqlBattleRule, [battleRules]);
};

exports.getBattleWithStatusPost = async (groupId) => {
  const sqlBattlePostStatus = 'SELECT b.battle_id FROM battle AS b WHERE b.group_id = ? AND b.status_id = 1';
  const stats = connection.query(sqlBattlePostStatus, groupId);
  return stats[0];
};

exports.addUserToBattle = async (userWithBattleId) => {
  const sqlUserBattle = 'INSERT INTO user_battle VALUES ?';
  connection.query(sqlUserBattle, userWithBattleId);
};

exports.getBattleParticipantUploadStatus = async (battleId) => {
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
  const stats = connection.query(sqlBattlePostStatus, [battleId, battleId]);
  return stats;
};

exports.getUserPostedPhotoInformation = async (userId, queryId) => {
  const sql = `SELECT *
            FROM photo AS p
            WHERE p.user_id = ?
            AND p.battle_id IN(?)`;
  const values = [userId, queryId];
  const stats = connection.query(sql, values);
  return stats;
};

exports.getPendingGroupBattle = async (groupId) => {
  const sqlGetPendingBattleGroup = `SELECT battle_id, status_id
            FROM battle
            WHERE group_id = ?
            AND status_id != 3`;
  const pendingBattle = connection.query(sqlGetPendingBattleGroup, groupId);
  return pendingBattle;
};

exports.getBattleVoteStatus = async (battleId) => {
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
  const battleVoteStatus = connection.query(sqlBattleVoteStatus, [battleId, battleId]);
  return battleVoteStatus;
};

exports.getUserVoteStatus = async (userId, battleId) => {
  const sql = `SELECT p.photo_id, p.photo_url, up.vote
            FROM user_photo AS up
            JOIN photo AS p
            ON p.photo_id = up.photo_id
            WHERE up.user_id = ?
            AND p.battle_id = ?`;
  const values = [userId, battleId];
  const userVoteStatus = connection.query(sql, values);
  return userVoteStatus;
};

exports.getBattleInformation = async (battleId) => {
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
  const battleInfos = connection.query(sqlBattleInfos, valueBattleId);
  return battleInfos;
};

exports.getUserAllBattlesInformation = async (userId) => {
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
  const userBattleInformation = connection.query(sqlGetBattleInformation, userId);
  return userBattleInformation;
};

exports.getUserGroupBattlesInformation = async (userId, groupId) => {
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
  const userGroupBattleInformation = connection.query(sqlGetBattleInformation, sqlGetBattleInformationValues);
  return userGroupBattleInformation;
};

exports.getBattleParticipantListWithScores = async (battleId) => {
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
  const battleParticipantListWithScores = connection.query(sqlParticipantsList, battleId);
  return battleParticipantListWithScores;
};

exports.getUserCountOfVictories = async (userId) => {
  const sqlUserVictories = `SELECT COUNT(winner_user_id) AS victories
    FROM user AS u
    LEFT JOIN battle AS b
      ON u.user_id = b.winner_user_id
    WHERE user_id = ?`;
  const userCountOfVictories = connection.query(sqlUserVictories, userId);
  return userCountOfVictories;
};

exports.getBattleParticipantVictories = async (battleId) => {
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
  const battleParticipantVictories = connection.query(sqlVictoriesParticipants, battleId);
  return battleParticipantVictories;
};

exports.getUserCountOfBattles = async (userId) => {
  const sqlNumberBattlesUser = 'SELECT count(*) AS nb_battles FROM user_battle WHERE user_id = ?';
  const userCountOfBattles = connection.query(sqlNumberBattlesUser, userId);
  return userCountOfBattles;
};

exports.getUserRanking = async (userId) => {
  const sql = `SELECT u.user_id, u.username, a.avatar_url, COUNT(winner_user_id) AS victories
      FROM user AS u
      INNER JOIN avatar AS a
        ON u.avatar_id = a.avatar_id
      LEFT JOIN battle AS b
        ON u.user_id = b.winner_user_id
      WHERE u.user_id IN
      (SELECT DISTINCT ugr.user_id AS contacts
      FROM user_group AS ugr
      WHERE ugr.group_id IN (SELECT ug.group_id FROM user_group AS ug WHERE user_id = ?))
      GROUP BY u.user_id
      ORDER BY victories DESC`;
  const userRanking = connection.query(sql, userId);
  return userRanking;
};

exports.updateStatus = async (battleId, newStatus) => {
  const sqlUpdateStatus = `UPDATE battle
      SET status_id = ?
      WHERE battle_id = ?`;
  const stats = connection.query(sqlUpdateStatus, [newStatus, battleId]);
  return stats;
};

exports.getBattleByStatus = async (statusId) => {
  const sql = `SELECT battle_id, deadline
      FROM battle
      WHERE status_id = ?`;
  const battles = connection.query(sql, statusId);
  return battles;
};

exports.getUserBattleData = async (battleId) => {
  const sql = `SELECT u.username, u.email
      FROM user AS u
      JOIN user_battle AS ub
      ON u.user_id = ub.user_id
      WHERE ub.battle_id = ?`;
  return connection.queryAsync(sql, battleId);
};

exports.getBattleInfos = async (battleId) => {
  const sql = `SELECT g.group_id, g.group_name, t.theme_name
    FROM battle AS b
    JOIN theme AS t
    ON b.theme_id = t.theme_id
    JOIN \`group\` AS g
    ON b.group_id = g.group_id
    WHERE b.battle_id = ?`;
  return connection.queryAsync(sql, battleId).then((battleInfos) => battleInfos[0]);
};

exports.setBattleWinner = async (battleId) => {
  const updateWinner = `UPDATE battle
      SET winner_user_id =
        (SELECT user_id
        FROM photo AS p
        WHERE battle_id = ?
        ORDER BY score DESC
        LIMIT 1)
    WHERE battle_id = ?`;
  return connection.query(updateWinner, [battleId, battleId]);
};
