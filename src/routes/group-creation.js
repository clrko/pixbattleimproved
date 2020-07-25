const express = require('express')

const checkToken = require('../helper/checkToken')
const connection = require('../helper/db')
const eventEmitterMail = require('../helper/eventEmitterMail')
const { encrypt } = require('../helper/encryptionCode')

const router = express.Router()

// Quand l'utilisateur clique sur le bouton 'Créer un groupe' sur la page profil
router.post('/', checkToken, (req, res) => {
  const sqlCreateGroup = 'INSERT INTO `group` (admin_user_id, group_name) VALUES (?, ?)'
  const values = [
    req.user.userId,
    req.body.groupName
  ]
  connection.query(sqlCreateGroup, values, (err, stats) => {
    if (err) throw err
    const groupId = stats.insertId
    const sqlGroupUser = 'INSERT INTO user_group VALUES (?, ?)'
    const insertValues = [
      req.user.userId,
      groupId
    ]
    connection.query(sqlGroupUser, insertValues, err => {
      if (err) throw err
      const emails = req.body.emails
      const invitationCode = encrypt(`group${groupId}`)
      eventEmitterMail.emit('sendMail', { type: 'invite', to: emails, subject: `Rejoins le groupe de ${req.user.username}`, invitationCode: invitationCode })
      res.status(201).send({ groupId })
    })
  })
})

module.exports = router
