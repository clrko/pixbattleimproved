const { updateStatus } = require('../models/battle');

const updateBattleStatus = async (battleId, newStatus, cb) => {
  try {
    const stats = await updateStatus;
    return cb(null, stats);
  } catch (err) {
    return cb(err);
  }
};

module.exports = updateBattleStatus;
