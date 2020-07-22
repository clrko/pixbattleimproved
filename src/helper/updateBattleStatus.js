const connection = require('./db')

const updateBattleStatus = (battleId, newStatus, cb) => {
  const sqlUpdateStatus =
    `UPDATE battle
    SET status_id = ?
    WHERE battle_id = ?`
  connection.query(sqlUpdateStatus, [newStatus, battleId], (err, stats) => {
    if (err) return cb(err)
    return cb(null, stats)
  })
}

module.exports = updateBattleStatus
