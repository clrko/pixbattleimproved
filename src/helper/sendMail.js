const transporter = require('./transporter')
const { mailUser, appBaseUrl } = require('../../config')

const sendMail = ({ type, to, subject, groupId }) => {
  const mailContent =
  `
  <h1>Hello</h1>
  <p>Tu as été invité à rejoindre Pix battle</p>
  <a href=${appBaseUrl}/invite/${groupId}><strong>ME CONNECTER</strong></a>
  `
  const mailOptions = {
    from: `"Maxime de PixBattle" <${mailUser}>`,
    to,
    subject,
    html: mailContent
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
/* utiliser le type pour identifier le template à utiliser */
