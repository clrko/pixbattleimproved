const bcrypt = require('bcrypt')
const express = require('express')
const jwt = require('jsonwebtoken')

const connection = require('../helper/db')
const { jwtSecret } = require('../../config')

const router = express.Router()

router.post('/', (req, res) => {
  const sql = 'SELECT user_id, username, email FROM user WHERE email = ?'
  const email = req.body.email
  console.log(req.body.invitationCode)
  connection.query(sql, [email], (err, result) => {
    if (err) throw err
    // Utilisateur non inscrit
    if (!result[0]) {
      const saltRounds = 10
      const myPlaintextPassword = req.body.password
      return bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) throw err
        bcrypt.hash(myPlaintextPassword, salt, (err, hash) => {
          if (err) throw err
          const sql = 'INSERT INTO user(username, email, password, avatar_id) VALUES(?, ?, ?, 1)'
          const insertValues = [
            req.body.username,
            email,
            hash
          ]
          connection.query(sql, insertValues, err => {
            if (err) throw err
            const sql = 'SELECT user_id, username, a.avatar_url FROM user JOIN avatar AS a ON user.avatar_id = a.avatar_id  WHERE email = ?'
            const selectValues = [
              email
            ]
            connection.query(sql, selectValues, (err, result) => {
              if (err) throw err
              // Utilisateur invité
              if (req.body.invitationCode) {
                const sqlInviteGroup = 'INSERT INTO user_group (user_id, group_id) VALUES (?, ?)'
                const valuesInviteGroup = [result[0].user_id, req.body.invitationCode]
                connection.query(sqlInviteGroup, valuesInviteGroup, err => {
                  if (err) throw err
                  const sqlInviteBattle = 'INSERT INTO user_battle (user_id, battle_id) VALUES (?, (SELECT b.battle_id FROM battle AS b WHERE b.group_id = ? AND b.status_id = 1))'
                  const valuesInviteBattle = [result[0].user_id, req.body.invitationCode]
                  connection.query(sqlInviteBattle, valuesInviteBattle, err => { if (err) throw err })
                })
              }
              const tokenUserInfo = {
                userId: result[0].user_id,
                username: result[0].username,
                avatar: result[0].avatar_url
              }
              const token = jwt.sign(tokenUserInfo, jwtSecret)
              res.header('Access-Control-Expose-Headers', 'x-access-token')
              res.set('x-access-token', token)
              return res.status(200).send(tokenUserInfo)
            })
          })
        })
      })
    }
    // Utilisateur inscrit
    if (result[0].email && result[0].username) {
      return res.send('Tu es déjà inscrit')
    }
  })
})

module.exports = router
