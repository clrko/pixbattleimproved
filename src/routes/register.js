const bcrypt = require('bcrypt')
const express = require('express')
const jwt = require('jsonwebtoken')

const connection = require('../helper/db.js')

const router = express.Router()
const { jwtSecret } = require('../../config.js')

router.get('/', (req, res) => {
  res.send('I am on GET /pixBattle/register')
})

router.post('/', (req, res) => {
  const sql = 'SELECT username, email FROM user WHERE email = ?'
  const email = req.body.email
  connection.query(sql, [email], (err, result) => {
    if (err) throw err
    if (!result[0]) {
      const saltRounds = 10
      const myPlaintextPassword = req.body.password
      bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) throw err
        bcrypt.hash(myPlaintextPassword, salt, (err, hash) => {
          if (err) throw err
          const sql = 'INSERT INTO user(username, email, password, create_date) VALUES(?, ?, ?, NOW())'
          const values = [
            req.body.username,
            req.body.email,
            hash
          ]
          connection.query(sql, values, (err, result) => {
            if (err) throw err
            if (result) {
              const sql = 'SELECT user_id, username FROM user WHERE email = ?'
              const values = [
                req.body.email
              ]
              connection.query(sql, values, (err, result) => {
                if (err) throw err
                if (result) {
                  const tokenUserInfo = {
                    userId: result[0].user_id,
                    username: result[0].username
                  }
                  const token = jwt.sign(tokenUserInfo, jwtSecret)
                  res.header('Access-Control-Expose-Headers', 'x-access-token')
                  res.set('x-access-token', token)
                  return res.status(200).send(tokenUserInfo)
                }
              })
            }
          })
        })
      })
    } else if (result[0].email && !result[0].username) {
      const saltRounds = 10
      const myPlaintextPassword = req.body.password
      bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) throw err
        bcrypt.hash(myPlaintextPassword, salt, (err, hash) => {
          if (err) throw err
          const sql = 'UPDATE user SET username = ?, password = ? WHERE email = ?'
          const values = [
            req.body.username,
            hash,
            req.body.email
          ]
          connection.query(sql, values, (err, result) => {
            if (err) throw err
            if (result) {
              const sql = 'SELECT user_id, username FROM user WHERE email = ?'
              const values = [
                req.body.email
              ]
              connection.query(sql, values, (err, result) => {
                if (err) throw err
                if (result) {
                  const tokenUserInfo = {
                    userId: result[0].user_id,
                    username: result[0].username
                  }
                  const token = jwt.sign(tokenUserInfo, jwtSecret)
                  res.header('Access-Control-Expose-Headers', 'x-access-token')
                  res.set('x-access-token', token)
                  return res.status(200).send(tokenUserInfo)
                }
              })
            }
          })
        })
      })
    } else {
      res.send('Tu es déjà inscrit')
    }
  })
})

module.exports = router
