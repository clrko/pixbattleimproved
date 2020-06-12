const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const connection = require('../helper/db')
const { jwtSecret } = require('../../config')

const router = express.Router()

router.get('/', (req, res) => {
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
    const userId = result[0].user_id
    const username = result[0].username
    const avatar = result[0].avatar_url

    bcrypt.compare(myPlaintextPassword, result[0].password, (err, result) => {
      if (err) throw err
      if (result) {
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
