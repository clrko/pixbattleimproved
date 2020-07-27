const transporter = require('./transporter')
const path = require('path')
const { mailUser, appBaseUrl, appName } = require('../../config')

const sendMail = ({ type, to, subject, invitationCode, userName }) => {
  const getActionUrl = selectedType => {
    switch (selectedType) {
      case 'invitation':
        return `${appBaseUrl}/invite/${invitationCode}`
      case 'welcome':
        return `${appBaseUrl}/`
    }
  }

  const mailOptions = {
    from: `"Maxime de ${appName}" <${mailUser}>`,
    bcc: to,
    subject,
    template: type,
    attachments: [{
      filename: 'logo.svg',
      path: path.resolve(__dirname, '../assets/logo/logo.svg'),
      cid: 'mainLogo'
    }],
    context: {
      appBaseUrl,
      appName,
      action_url: getActionUrl(type),
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
