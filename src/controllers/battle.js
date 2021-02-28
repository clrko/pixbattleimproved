const {
  getThemeList,
  getRuleList,
  createNewBattle,
  insertBattleRules,
  getBattleParticipantUploadStatus,
  getUserPostedPhotoInformation,
  getBattleInformation,
  getBattleVoteStatus,
  getUserVoteStatus,
  getUserAllBattlesInformation,
  getUserGroupBattlesInformation,
  getPendingGroupBattle,
  addUserToBattle,
  getBattleParticipantListWithScores,
  getBattleParticipantVictories,
} = require('../models/battle');
const { getGroupName, getGroupMembers } = require('../models/group');

const {
  updatePhoto,
  uploadPhoto,
  deletePhoto,
  getBattlePhotosForVote,
  insertUserVotes,
  getBattleUsersWithPhotos,
  getAllBattlePhotos,
} = require('../models/photo');

const { sendBattleCreationMail } = require('../helpers/sendInvitationMail');

const {
  scheduleStatusUpdatePostToVote,
  scheduleStatusUpdateVoteToCompleted,
} = require('../helpers/updateBattleStatusJobs');

exports.getAndSendThemeList = async (req, res, next) => {
  try {
    const themes = await getThemeList();
    return res.status(201).send(themes);
  } catch (err) {
    next(err);
  }
};

exports.getAndSendRuleList = async (req, res, next) => {
  try {
    const rules = await getRuleList();
    return res.status(201).send(rules);
  } catch (err) {
    next(err);
  }
};

exports.createNewBattleAndNotifyUsers = async (req, res, next) => {
  try {
    const { userId, username } = req.user;
    const { deadline, groupId, themeId, rulesId } = req.body;
    const createdBattleId = await createNewBattle(deadline, groupId, themeId, userId);

    // Schedule battle status jobs
    const battleIdDeadline = { battle_id: createdBattleId, deadline: new Date(deadline) };
    scheduleStatusUpdatePostToVote(battleIdDeadline);
    scheduleStatusUpdateVoteToCompleted(battleIdDeadline);

    // Store the battle selected rules
    const battleRules = rulesId.map((rule) => [createdBattleId, rule]);
    await insertBattleRules(battleRules);

    // Add users to the new battle
    const groupMembers = await getGroupMembers(groupId);
    const userWithBattleId = groupMembers.map((member) => [member.user_id, createdBattleId]);
    await addUserToBattle(userWithBattleId);

    // Send notification email to users
    const groupName = await getGroupName(groupId); // verifier si on reçoit un tableau
    groupMembers.forEach((user) =>
      sendBattleCreationMail(user.email, username, user.username, groupId, groupName, createdBattleId),
    );
    return res.status(201).send({ battleId: createdBattleId });
  } catch (err) {
    next(err);
  }
};

exports.getAndSendBattleMemberUploadStatus = async (req, res, next) => {
  try {
    const battleId = [req.params.battleId];
    const battleMemberStatus = await getBattleParticipantUploadStatus(battleId);
    return res.status(200).send(battleMemberStatus);
  } catch (err) {
    next(err);
  }
};

//voir pouruqoi on a besoin du req.queyr pour avoir le battle id!! Fonction fdupliquée
exports.getUserPostedPhoto = async (req, res, next) => {
  try {
    const userPostedPhoto = await getUserPostedPhotoInformation(req.user.userId, req.query.id);
    return res.status(200).send(userPostedPhoto);
  } catch (err) {
    next(err);
  }
};

exports.getAndSendUserPostedPhoto = async (req, res, next) => {
  try {
    const userPostedPhoto = await getUserPostedPhotoInformation(req.user.userId, req.body.battleId);
    return res.status(200).send(userPostedPhoto);
  } catch (err) {
    next(err);
  }
};

exports.getAndSendUserBattlePostInformation = async (req, res, next) => {
  try {
    const battleId = req.params.battleId;
    const userPhoto = await getUserPostedPhotoInformation(req.user.userId, battleId);
    const battleInfos = await getBattleInformation(battleId);
    const photo = userPhoto[0];
    const infos = {
      photoUrl: photo && photo.photo_url,
      battleInfos,
    };
    return res.status(200).send(infos);
  } catch (err) {
    next(err);
  }
};

exports.uploadPhotoAndSendId = async (req, res, next) => {
  try {
    const battleId = req.body.battleId;
    const userId = req.user.userId;
    const userPhoto = await getUserPostedPhotoInformation(userId, battleId);
    if (userPhoto.length > 0) {
      return res.sendStatus(409);
    }
    const uploadedPhotoId = await uploadPhoto(req.file.filename, userId, battleId, req.body.groupId);
    return res.status(201).send({ photoId: uploadedPhotoId });
  } catch (err) {
    next(err);
  }
};

exports.updatePhoto = async (req, res, next) => {
  try {
    await updatePhoto(req.body.photoUrl, req.params.photoId);
    return res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

exports.deletePhoto = async (req, res, next) => {
  try {
    await deletePhoto(req.body.photoId);
    return res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

exports.getAndSendPhotosToVote = async (req, res, next) => {
  try {
    const photosBattleUrls = await getBattlePhotosForVote(req.params.battleId, req.user.userId);
    return res.status(200).send(photosBattleUrls);
  } catch (err) {
    next(err);
  }
};

exports.getAndSendBattleVoteStatus = async (req, res, next) => {
  try {
    const battleStatus = await getBattleVoteStatus(req.params.battleId);
    return res.status(200).send(battleStatus);
  } catch (err) {
    next(err);
  }
};

exports.getAndSendUserVoteStatus = async (req, res, next) => {
  try {
    const userVoteStatus = await getUserVoteStatus(req.user.userId, req.params.battleId);
    return res.status(200).send(userVoteStatus);
  } catch (err) {
    next(err);
  }
};

exports.insertUserVotes = async (req, res, next) => {
  try {
    const votes = [
      req.user.userId,
      req.body.photoId1,
      req.body.vote1,
      req.user.userId,
      req.body.photoId2,
      req.body.vote2,
      req.user.userId,
      req.body.photoId3,
      req.body.vote3,
    ];
    await insertUserVotes(votes);
    return res.sendStatus(201);
  } catch (err) {
    next(err);
  }
};

exports.getAndSendParticipantBattleResults = async (req, res, next) => {
  try {
    const battleId = [req.params.battleId];
    const battleParticipantListWithScores = await getBattleParticipantListWithScores(battleId);
    const battleParticipantVictories = await getBattleParticipantVictories(battleId);
    const infosResultsParticipants = {
      battleParticipantListWithScores,
      battleParticipantVictories,
    };
    return res.status(200).send(infosResultsParticipants);
  } catch (err) {
    next(err);
  }
};

exports.getAndSendPhotoBattleResults = async (req, res, next) => {
  try {
    const battleId = [req.params.battleId];
    const resultsPhotos = await getBattleUsersWithPhotos(battleId);
    //to be checked as before it  needed 2 sql query tog et users and to get photos
    return res.status(200).send(resultsPhotos);
  } catch (err) {
    next(err);
  }
};

exports.getAndSendUserAllBattles = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userBattleInformation = await getUserAllBattlesInformation(userId);
    return res.status(200).send(userBattleInformation);
  } catch (err) {
    next(err);
  }
};

exports.getAndSendUserGroupBattles = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const groupId = req.params.groupId;
    const userGroupBattleInformation = await getUserGroupBattlesInformation(userId, groupId);
    return res.status(200).send(userGroupBattleInformation);
  } catch (err) {
    next(err);
  }
};

exports.getAndSendPendingGroupBattle = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const pendingGroupBattle = await getPendingGroupBattle(groupId);
    return res.json({ pending: pendingGroupBattle.length > 0 });
  } catch (err) {
    next(err);
  }
};

exports.getAndSendAllBattlePhotos = async (req, res, next) => {
  try {
    const battleId = [req.params.battleId];
    const photosBattleUrls = await getAllBattlePhotos(battleId);
    return res.status(200).send(photosBattleUrls);
  } catch (err) {
    next(err);
  }
};
