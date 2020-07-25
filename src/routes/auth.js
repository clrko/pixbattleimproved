const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const connection = require('../helper/db')
const { jwtSecret } = require('../../config')
const { decrypt } = require('../helper/encryptionCode')

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
    const { user_id: userId, username, avatar_url: avatar, email: userEmail } = result[0]
    bcrypt.compare(myPlaintextPassword, result[0].password, (err, passwordMatch) => {
      if (err) throw err
      if (passwordMatch) {
        // If user has received an invitation code
        if (req.body.invitationCode) {
          const groupId = decrypt(req.body.invitationCode).substr(5)
          // Check if user is already part of the group
          const sqlInviteCheck = 'SELECT user_id, group_id FROM user_group WHERE user_id = ? AND group_id = ?'
          const valuesInvite = [userId, groupId]
          connection.query(sqlInviteCheck, valuesInvite, (err, resultCheck) => {
            if (err) throw err
            // User not part of the group
            if (resultCheck.length === 0) {
              const sqlInviteGroup = 'INSERT INTO user_group (user_id, group_id) VALUES (?, ?)'
              connection.query(sqlInviteGroup, valuesInvite, err => {
                if (err) throw err
                const sqlInviteBattle = 'INSERT INTO user_battle (user_id, battle_id) VALUES (?, (SELECT b.battle_id FROM battle AS b WHERE b.group_id = ? AND b.status_id = 1))'
                const valuesInviteBattle = [userId, groupId]
                connection.query(sqlInviteBattle, valuesInviteBattle, err => { if (err) throw err })
              })
            }
          })
        }
        const tokenUserInfo = {
          userId: userId,
          username: username,
          avatar: avatar,
          userEmail: userEmail
        }
        const token = jwt.sign(tokenUserInfo, jwtSecret)
        res.header('Access-Control-Expose-Headers', 'x-access-token')
        res.set('x-access-token', token)
        return res.status(200).send(tokenUserInfo)
      } else {
        return res.sendStatus(401)
      }
    })
  })
})

module.exports = router
