const CronJob = require('cron').CronJob
const moment = require('moment')
const connection = require('./db')
const updateBattleStatus = require('./updateBattleStatus')

const getBattlesByStatus = (statusId, cb) => {
  const sql =
    `SELECT battle_id, deadline 
    FROM battle 
    WHERE status_id = ? AND deadline > NOW()`
  connection.query(sql, statusId, (err, battles) => {
    if (err) return cb(err)
    return cb(null, battles)
  })
}

getBattlesByStatus(1, (err, battles) => {
  if (err) throw err
  battles.forEach(scheduleStatusUpdatePostToVote)
})

getBattlesByStatus(2, (err, battles) => {
  if (err) throw err
  battles.forEach(scheduleStatusUpdateVoteToCompleted)
})

const scheduleStatusUpdatePostToVote = (battle) => {
  const job = new CronJob(battle.deadline, function () {
    updateBattleStatus(battle.battle_id, 2, err => {
      if (err) {
        console.log(err)
      } else {
        console.log(`Change battle status to vote for ${battle.battle_id}`)
      }
    })
  }, null, true, 'Europe/Paris')
  job.start()
}

const updatePhotoScore = photoId => {
  const sqlUpdate =
    `UPDATE photo 
      SET score = (SELECT SUM(vote)
    FROM user_photo
    WHERE photo_id = ?) 
    WHERE photo_id = ?`
  connection.query(sqlUpdate, photoId, photoId, err => {
    if (err) return err
  })
}

const updateBattlePhotosScores = (battleId) => {
  const sqlSelect =
    `SELECT photo_id
    FROM photo
    WHERE battle_id = ?`
  connection.query(sqlSelect, battleId, (err, results) => {
    if (err) return err
    const photoIds = results.map(result => result.photo_id)
    photoIds.forEach(updatePhotoScore)
  })
}

const scheduleStatusUpdateVoteToCompleted = (battle) => {
  const finalDate = moment(battle.deadline).add(1, 'minute')
  const job = new CronJob(finalDate, function () {
    updateBattleStatus(battle.battle_id, 3, err => {
      if (err) {
        console.log(err)
      } else {
        updateBattlePhotosScores(battle.battle_id)
        console.log(`Change battle status to completed for ${battle.battle_id}`)
      }
    })
  }, null, true, 'Europe/Paris')
  job.start()
}

module.exports = { scheduleStatusUpdatePostToVote, scheduleStatusUpdateVoteToCompleted }
