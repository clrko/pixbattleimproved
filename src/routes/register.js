const bcrypt = require('bcrypt')
const express = require('express')
const jwt = require('jsonwebtoken')

const connection = require('../helper/db')
const { jwtSecret } = require('../../config')
const eventEmitterMail = require('../helper/eventEmitterMail')
const { decrypt } = require('../helper/encryptionCode')

const router = express.Router()

router.post('/', (req, res, next) => {
  const sql = 'SELECT user_id, username, email FROM user WHERE email = ?'
  const email = req.body.email
  connection.query(sql, [email], (err, result) => {
    if (err) return next(err)
    // Utilisateur non inscrit
    if (!result[0]) {
      const saltRounds = 10
      const myPlaintextPassword = req.body.password
      return bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) return next(err)
        bcrypt.hash(myPlaintextPassword, salt, (err, hash) => {
          if (err) return next(err)
          const sql = 'INSERT INTO user(username, email, password, avatar_id) VALUES(?, ?, ?, 1)'
          const insertValues = [
            req.body.username,
            email,
            hash
          ]
          connection.query(sql, insertValues, err => {
            if (err) return next(err)
            const sql = 'SELECT user_id, username, email, a.avatar_url FROM user JOIN avatar AS a ON user.avatar_id = a.avatar_id  WHERE email = ?'
            const selectValues = [
              email
            ]
            connection.query(sql, selectValues, (err, result) => {
              if (err) return next(err)
              // Utilisateur invité
              if (req.body.invitationCode) {
                const groupId = decrypt(req.body.invitationCode).substr(5)
                const sqlInviteGroup = 'INSERT INTO user_group (user_id, group_id) VALUES (?, ?)'
                const valuesInviteGroup = [result[0].user_id, groupId]
                connection.query(sqlInviteGroup, valuesInviteGroup, err => {
                  if (err) return next(err)
                  const sqlInviteBattle = 'INSERT INTO user_battle (user_id, battle_id) VALUES (?, (SELECT b.battle_id FROM battle AS b WHERE b.group_id = ? AND b.status_id = 1))'
                  const valuesInviteBattle = [result[0].user_id, groupId]
                  connection.query(sqlInviteBattle, valuesInviteBattle, err => { if (err) return next(err) })
                })
              }
              const tokenUserInfo = {
                userId: result[0].user_id,
                username: result[0].username,
                avatar: result[0].avatar_url,
                userEmail: result[0].email
              }
              const token = jwt.sign(tokenUserInfo, jwtSecret)
              res.header('Access-Control-Expose-Headers', 'x-access-token')
              res.set('x-access-token', token)
              eventEmitterMail.emit('sendMail', { type: 'welcome', to: result[0].email, subject: `Bienvenue chez PxBattle ${result[0].username}`, userName: result[0].username })
              return res.status(200).send(tokenUserInfo)
            })
          })
        })
      })
    }
    // Utilisateur inscrit
    if (result[0].email && result[0].username) {
      return res.sendStatus(409)
    }
  })
})

module.exports = router
