const transporter = require('./transporter')
const { mailUser/* , appBaseUrl  */ } = require('../../config')

const sendMail = ({ type, to, subject, invitationCode }) => {
/*   const mailContent =
  `
  <p>Tu as été invité à rejoindre Pix battle</p>
  <a href=${appBaseUrl}/invite/${invitationCode}><strong>JOUER</strong></a>
  ` */
  const mailOptions = {
    from: `"Maxime de PixBattle" <${mailUser}>`,
    bcc: to,
    subject,
    template: type
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
