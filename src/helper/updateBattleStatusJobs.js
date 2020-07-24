const CronJob = require('cron').CronJob
const moment = require('moment')
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
        console.log(`Change battle status to completed for ${battle.battle_id}`)
      }
    })
  }, null, true, 'Europe/Paris')
  job.start()
}
