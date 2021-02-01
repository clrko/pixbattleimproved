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
};
