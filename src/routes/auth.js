const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const connection = require('../helper/db')
const { jwtSecret } = require('../../config')

const router = express.Router()

router.post('/', (req, res) => {
  const sql = 'SELECT u.user_id, u.username, u.email, u.password, a.avatar_url FROM user AS u JOIN avatar AS a ON u.avatar_id = a.avatar_id WHERE email = ?'
  const values = [
    req.body.email
  ]
  connection.query(sql, values, (err, result) => {
    if (err) throw err
    if (result.length === 0) {
      return res.status(401).send('The password or username is wrong')
    }
    const myPlaintextPassword = req.body.password
    const { user_id: userId, username, avatar_url: avatar } = result[0]
    bcrypt.compare(myPlaintextPassword, result[0].password, (err, result) => {
      if (err) throw err
      if (result) {
        if (req.body.invitationCode) {
          const sqlInviteGroup = 'INSERT INTO user_group (user_id, group_id) VALUES (?, ?)'
          const valuesInviteGroup = [userId, req.body.invitationCode]
          connection.query(sqlInviteGroup, valuesInviteGroup, err => {
            if (err) throw err
            const sqlInviteBattle = 'INSERT INTO user_battle (user_id, battle_id) VALUES (?, (SELECT b.battle_id FROM battle AS b WHERE b.group_id = ? AND b.status_id = 1))'
            const valuesInviteBattle = [result[0].user_id, req.body.invitationCode]
            connection.query(sqlInviteBattle, valuesInviteBattle, err => { if (err) throw err })
          })
        }
        const tokenUserInfo = {
          userId: userId,
          username: username,
          avatar: avatar
        }
        const token = jwt.sign(tokenUserInfo, jwtSecret)
        res.header('Access-Control-Expose-Headers', 'x-access-token')
        res.set('x-access-token', token)
        return res.status(200).send(tokenUserInfo)
      } else {
        return res.status(401).send('The password or username is wrong')
      }
    })
  })
})

module.exports = router
