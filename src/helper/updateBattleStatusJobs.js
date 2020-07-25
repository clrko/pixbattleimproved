const CronJob = require('cron').CronJob
const moment = require('moment')
const Promise = require('bluebird')
const connection = require('./db')
const updateBattleStatus = require('./updateBattleStatus')
const { votingPhase } = require('../../config')

const getBattlesByStatus = (statusId, cb) => {
  const sql =
    `SELECT battle_id, deadline 
    FROM battle 
    WHERE status_id = ?`
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
  const isPast = moment().isAfter(moment(battle.deadline))
  if (isPast) {
    console.warn(`Battle ${battle.battle_id} has deadline in the past: ${battle.deadline}`)
    return
  }
  console.log(`Scheduling update to VOTE for battle ${battle.battle_id} @ ${battle.deadline}`)
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
  return connection.queryAsync(sqlUpdate, [photoId, photoId])
}

const updateBattlePhotosScores = battleId => {
  const sqlSelect =
    `SELECT photo_id
    FROM photo
    WHERE battle_id = ?`
  connection.query(sqlSelect, battleId, (err, results) => {
    if (err) return err
    const photoIds = results.map(result => result.photo_id)
    Promise.map(photoIds, photoId => updatePhotoScore(photoId))
      .then(() => setBattleWinner(battleId))
  })
}

const setBattleWinner = battleId => {
  const updateWinner =
    `UPDATE battle
    SET winner_user_id = 
      (SELECT user_id
      FROM photo AS p
      WHERE battle_id = ?
      ORDER BY score DESC
      LIMIT 1)
  WHERE battle_id = ?`
  connection.query(updateWinner, [battleId, battleId], err => {
    if (err) return err
  })
}

const scheduleStatusUpdateVoteToCompleted = (battle) => {
  const { durationNumber, durationUnit } = votingPhase
  const finalDate = moment(battle.deadline).add(durationNumber, durationUnit)
  const isPast = moment().isAfter(moment(finalDate))
  if (isPast) {
    console.warn(`Battle ${battle.battle_id} has end of voting phase in the past: ${finalDate}`)
    return
  }
  console.log(`Scheduling update to COMPLETED for battle ${battle.battle_id} @ ${finalDate}`)
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
