const pool = require('../helper/db');

module.exports = {
  async getGlobalCountOfBattles() {
    const rows = pool.query('SELECT COUNT(*) as count FROM battle');
    return rows[0];
  },
};
