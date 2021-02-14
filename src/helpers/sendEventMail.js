const eventEmitterMail = require('./eventEmitterMail');
const { encrypt } = require('./encryptionCode');

module.exports = {
  sendInvitationMail(emails, username, groupId) {
    const invitationCode = encrypt(`group${groupId}`);
    eventEmitterMail.emit('sendMail', {
      type: 'invitation',
      to: emails,
      subject: `Rejoins le groupe de ${username}`,
      invitationCode,
      username,
    });
  },

  sendBattleCreationMail(email, creatorUsername, username, groupId, groupName, createdBattleId) {
    eventEmitterMail.emit('sendMail', {
      type: 'battleNew',
      to: email,
      subject: `${creatorUsername} a créé une nouvelle battle`,
      userName: username,
      groupId,
      groupName,
      battleId: createdBattleId,
    });
  },

  sendWelcomeMail(email, username) {
    eventEmitterMail.emit('sendMail', {
      type: 'welcome',
      to: email,
      subject: `Bienvenue chez PixBattle ${username}`,
      userName: username,
    });
  },

  sendBattleStatusChangeToVoteMail(email, userName, groupId, groupName, battleId, themeName) {
    eventEmitterMail.emit('sendMail', {
      type: 'battlePostToVote',
      to: email,
      subject: 'Les votes sont ouverts!',
      userName,
      groupId,
      groupName,
      battleId,
      themeName,
    });
  },

  sendBattleStatusChangeToResultsMail(email, userName, groupId, groupName, battleId, themeName) {
    eventEmitterMail.emit('sendMail', {
      type: 'battleVoteToResults',
      to: email,
      subject: 'Les resultats sont disponibles',
      userName,
      groupId,
      groupName,
      battleId: battleId,
      themeName,
    });
  },
};
