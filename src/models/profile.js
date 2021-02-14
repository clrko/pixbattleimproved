const connection = require('../helper/db');

module.exports = {
  async getAvatars() {
    const sql = 'SELECT * FROM avatar';
    const avatars = connection.query(sql);
    return avatars;
  },

  async updateUserInformation(valuesToUpdate, userId) {
    const sqlToUpdate = `UPDATE user
            SET ?
            WHERE user_id = ?`;
    connection.query(sqlToUpdate, [valuesToUpdate, userId]);
  },
};
