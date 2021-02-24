const pool = require('../helpers/db');

module.exports = {
  async getGlobalCountOfBattles() {
    const rows = pool.query('SELECT COUNT(*) as count FROM battle');
    return rows[0];
  },
};
