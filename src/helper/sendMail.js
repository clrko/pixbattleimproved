const transporter = require('./transporter')
const path = require('path')
const { mailUser, appBaseUrl, appName } = require('../../config')

const sendMail = ({ type, to, subject, invitationCode, userName }) => {
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
      invitation_url: `${appBaseUrl}/invite/${invitationCode}`,
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
