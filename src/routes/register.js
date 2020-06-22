const bcrypt = require('bcrypt')
const express = require('express')
const jwt = require('jsonwebtoken')

const connection = require('../helper/db')
const { jwtSecret } = require('../../config')

const router = express.Router()

router.post('/', (req, res) => {
  const sql = 'SELECT username, email FROM user WHERE email = ?'
  const email = req.body.email
  connection.query(sql, [email], (err, result) => {
    if (err) throw err
    // Utilisateur non inscrit et non invité
    if (!result[0]) {
      const saltRounds = 10
      const myPlaintextPassword = req.body.password
      return bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) throw err
        bcrypt.hash(myPlaintextPassword, salt, (err, hash) => {
          if (err) throw err
          const sql = 'INSERT INTO user(username, email, password, create_date) VALUES(?, ?, ?, NOW())'
          const insertValues = [
            req.body.username,
            email,
            hash
          ]
          connection.query(sql, insertValues, err => {
            if (err) throw err
            const sql = 'SELECT user_id, username FROM user WHERE email = ?'
            const selectValues = [
              email
            ]
            connection.query(sql, selectValues, (err, result) => {
              if (err) throw err
              const tokenUserInfo = {
                userId: result[0].user_id,
                username: result[0].username
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
    // Utilisateur invité mais pas encore inscrit
    const saltRounds = 10
    const myPlaintextPassword = req.body.password
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) throw err
      bcrypt.hash(myPlaintextPassword, salt, (err, hash) => {
        if (err) throw err
        const sql = 'UPDATE user SET username = ?, password = ? WHERE email = ?'
        const updateValues = [
          req.body.username,
          hash,
          req.body.email
        ]
        connection.query(sql, updateValues, err => {
          if (err) throw err
          const sql = 'SELECT user_id, username FROM user WHERE email = ?'
          const selectValues = [
            email
          ]
          connection.query(sql, selectValues, (err, result) => {
            if (err) throw err
            const tokenUserInfo = {
              userId: result[0].user_id,
              username: result[0].username
            }
            const token = jwt.sign(tokenUserInfo, jwtSecret)
            res.header('Access-Control-Expose-Headers', 'x-access-token')
            res.set('x-access-token', token)
            return res.status(200).send(tokenUserInfo)
          })
        })
      })
    })
  })
})

module.exports = router
