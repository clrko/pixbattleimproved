const CronJob = require('cron').CronJob
const moment = require('moment')
const Promise = require('bluebird')
const connection = require('./db')
const logger = require('./logger')
const eventEmitterMail = require('./eventEmitterMail')
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

const getUserBattleData = async battleId => {
  const sql =
  `SELECT u.username, u.email
  FROM user AS u
  JOIN user_battle AS ub
  ON u.user_id = ub.user_id
  WHERE ub.battle_id = ?`
  return connection.queryAsync(sql, battleId)
}

const getBattleInfos = async battleId => {
  const sql =
  `SELECT g.group_id, g.group_name, t.theme_name
  FROM battle AS b
  JOIN theme AS t
  ON b.theme_id = t.theme_id
  JOIN \`group\` AS g
  ON b.group_id = g.group_id
  WHERE b.battle_id = ?`
  return connection.queryAsync(sql, battleId)
    .then(battleInfos => battleInfos[0])
}

const scheduleStatusUpdatePostToVote = (battle) => {
  const isPast = moment().isAfter(moment(battle.deadline))
  if (isPast) {
    logger.warn(`Battle ${battle.battle_id} has deadline in the past: ${battle.deadline}`)
    return
  }
  logger.info(`Scheduling update to VOTE for battle ${battle.battle_id} @ ${battle.deadline}`)
  const job = new CronJob(battle.deadline, function () {
    updateBattleStatus(battle.battle_id, 2, async err => {
      if (err) {
        logger.error(err)
      } else {
        const userBattleData = await getUserBattleData(battle.battle_id)
        const { group_id: groupId, group_name: groupName, theme_name: themeName } = await getBattleInfos(battle.battle_id)
        userBattleData.forEach(user => eventEmitterMail.emit('sendMail', { type: 'battlePostToVote', to: user.email, subject: 'Les votes sont ouverts!', userName: user.username, groupId, groupName, battleId: battle.battle_id, themeName }))
        logger.info(`Change battle status to vote for ${battle.battle_id}`)
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
    logger.warn(`Battle ${battle.battle_id} has end of voting phase in the past: ${finalDate}`)
    return
  }
  logger.info(`Scheduling update to COMPLETED for battle ${battle.battle_id} @ ${finalDate}`)
  const job = new CronJob(finalDate, function () {
    updateBattleStatus(battle.battle_id, 3, async err => {
      if (err) {
        logger.error(err)
      } else {
        updateBattlePhotosScores(battle.battle_id)
        const userBattleData = await getUserBattleData(battle.battle_id)
        const { group_id: groupId, group_name: groupName, theme_name: themeName } = await getBattleInfos(battle.battle_id)
        userBattleData.forEach(user => eventEmitterMail.emit('sendMail', { type: 'battleVoteToResults', to: user.email, subject: 'Les resultats sont disponibles', userName: user.username, groupId, groupName, battleId: battle.battle_id, themeName }))
        logger.info(`Change battle status to completed for ${battle.battle_id}`)
      }
    })
  }, null, true, 'Europe/Paris')
  job.start()
}

module.exports = { scheduleStatusUpdatePostToVote, scheduleStatusUpdateVoteToCompleted }
