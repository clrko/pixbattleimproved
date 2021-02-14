const CronJob = require('cron').CronJob;
const moment = require('moment');
const Promise = require('bluebird');
const logger = require('./logger');

const { votingPhase } = require('../../config');
const updateBattleStatus = require('./updateBattleStatus');
const { getBattleByStatus, getUserBattleData, getBattleInfos, setBattleWinner } = require('../models/battle');
const { updatePhotoScore, getPhotoIds } = require('../models/photo');
const { sendBattleStatusChangeToVoteMail, sendBattleStatusChangeToResultsMail } = require('./sendEventMail');

const getBattlesByStatus = (statusId, cb) => {
  try {
    const battles = getBattleByStatus(statusId);
    return cb(null, battles);
  } catch (err) {
    return cb(err);
  }
};

getBattlesByStatus(1, (err, battles) => {
  if (err) throw err;
  battles.forEach(scheduleStatusUpdatePostToVote);
});

getBattlesByStatus(2, (err, battles) => {
  if (err) throw err;
  battles.forEach(scheduleStatusUpdateVoteToCompleted);
});

const scheduleStatusUpdatePostToVote = (battle) => {
  const isPast = moment().isAfter(moment(battle.deadline));
  if (isPast) {
    logger.warn(`Battle ${battle.battle_id} has deadline in the past: ${battle.deadline}`);
    return;
  }
  logger.info(`Scheduling update to VOTE for battle ${battle.battle_id} @ ${battle.deadline}`);
  const job = new CronJob(
    battle.deadline,
    function () {
      updateBattleStatus(battle.battle_id, 2, async (err) => {
        if (err) {
          logger.error(err);
        } else {
          const userBattleData = await getUserBattleData(battle.battle_id);
          const { group_id: groupId, group_name: groupName, theme_name: themeName } = await getBattleInfos(
            battle.battle_id,
          );
          userBattleData.forEach((user) => {
            sendBattleStatusChangeToVoteMail(
              user.email,
              user.username,
              groupId,
              groupName,
              battle.battle_id,
              themeName,
            );
          });
          logger.info(`Change battle status to vote for ${battle.battle_id}`);
        }
      });
    },
    null,
    true,
    'Europe/Paris',
  );
  job.start();
};

const updateBattlePhotosScores = (battleId) => {
  try {
    const results = getPhotoIds(battleId);
    const photoIds = results.map((result) => result.photo_id);
    Promise.map(photoIds, (photoId) => updatePhotoScore(photoId)).then(() => setBattleWinner(battleId));
  } catch (err) {
    return err;
  }
};

const scheduleStatusUpdateVoteToCompleted = (battle) => {
  const { durationNumber, durationUnit } = votingPhase;
  const finalDate = moment(battle.deadline).add(durationNumber, durationUnit);
  const isPast = moment().isAfter(moment(finalDate));
  if (isPast) {
    logger.warn(`Battle ${battle.battle_id} has end of voting phase in the past: ${finalDate}`);
    return;
  }
  logger.info(`Scheduling update to COMPLETED for battle ${battle.battle_id} @ ${finalDate}`);
  const job = new CronJob(
    finalDate,
    function () {
      updateBattleStatus(battle.battle_id, 3, async (err) => {
        if (err) {
          logger.error(err);
        } else {
          updateBattlePhotosScores(battle.battle_id);
          const userBattleData = await getUserBattleData(battle.battle_id);
          const { group_id: groupId, group_name: groupName, theme_name: themeName } = await getBattleInfos(
            battle.battle_id,
          );
          userBattleData.forEach((user) =>
            sendBattleStatusChangeToResultsMail(
              user.email,
              user.username,
              groupId,
              groupName,
              battle.battle_id,
              themeName,
            ),
          );
          logger.info(`Change battle status to completed for ${battle.battle_id}`);
        }
      });
    },
    null,
    true,
    'Europe/Paris',
  );
  job.start();
};

module.exports = { scheduleStatusUpdatePostToVote, scheduleStatusUpdateVoteToCompleted };
