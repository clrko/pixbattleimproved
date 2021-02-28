const connection = require('../helpers/db');

exports.getAvatars = async () => {
  const sql = 'SELECT * FROM avatar';
  const avatars = connection.query(sql);
  return avatars;
};

exports.createNewUser = async (username, email, hash) => {
  const sql = 'INSERT INTO user(username, email, password, avatar_id) VALUES(?, ?, ?, 1)';
  const valueToInsert = [username, email, hash];
  connection.query(sql, valueToInsert);
};

exports.updateUserInformation = async (valuesToUpdate, userId) => {
  const sqlToUpdate = `UPDATE user
            SET ?
            WHERE user_id = ?`;
  connection.query(sqlToUpdate, [valuesToUpdate, userId]);
};

exports.getUserInformation = async (email) => {
  const sql =
    'SELECT user_id, username, email, a.avatar_url FROM user JOIN avatar AS a ON user.avatar_id = a.avatar_id  WHERE email = ?';
  connection.query(sql, email);
};

exports.checkIfEmailExist = async (email) => {
  const sql =
    'SELECT u.user_id, u.username, u.email, u.password, a.avatar_url FROM user AS u JOIN avatar AS a ON u.avatar_id = a.avatar_id WHERE email = ?';
  const values = [email];
  const stats = connection.query(sql, values);
  return stats;
};

exports.checkIfIsAlreadyInGroup = async (userId, groupId) => {
  const sqlInviteCheck = 'SELECT user_id, group_id FROM user_group WHERE user_id = ? AND group_id = ?';
  const valuesInvite = [userId, groupId];
  const stats = connection.query(sqlInviteCheck, valuesInvite);
  return stats;
};
