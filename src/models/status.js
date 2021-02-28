const pool = require('../helpers/db');

exports.getGlobalCountOfBattles = async () => {
  const rows = pool.query('SELECT COUNT(*) as count FROM battle');
  return rows[0];
};
