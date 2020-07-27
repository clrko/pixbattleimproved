const transporter = require('./transporter')
// const path = require('path')
const { mailUser, appBaseUrl, appName, serverBaseUrl } = require('../../config')

const sendMail = ({ type, to, subject, invitationCode, userName, groupId, groupName, battleId }) => {
  const getActionUrl = selectedType => {
    switch (selectedType) {
      case 'invitation':
        return `${appBaseUrl}/invite/${invitationCode}`
      case 'welcome':
        return `${appBaseUrl}`
      case 'battleNew':
        return `${appBaseUrl}/groups/${groupId}/battles/${battleId}/post-picture`
      case 'battlePostToVote':
        return `${appBaseUrl}/groups/${groupId}/battles/${battleId}/vote`
      case 'battleVoteToResults':
        return `${appBaseUrl}/groups/${groupId}/battles/${battleId}/results`
      default:
        return `${appBaseUrl}`
    }
  }

  const mailOptions = {
    from: `"Maxime de ${appName}" <${mailUser}>`,
    bcc: to,
    subject,
    template: type,
    attachments: [{
      filename: 'logo.svg',
      // path: path.resolve(__dirname, `${serverBaseUrl}/logo/logo.svg`),
      path: `${serverBaseUrl}/logo/logo.svg`,
      cid: 'mainLogo'
    }],
    context: {
      appBaseUrl,
      appName,
      serverBaseUrl,
      action_url: getActionUrl(type),
      groupName,
      logo: 'cid:mainLogo',
      mailUser,
      userName
    }
  }

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log('erreur est', err)
    } else {
      console.log('Email sent' + info.response)
    }
  })
}

module.exports = sendMail
