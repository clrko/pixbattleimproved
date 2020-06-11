const bcrypt = require('bcrypt')
const express = require('express')

const connection = require('../helper/db.js')

const Router = express.Router()

Router.get('/register', (req, res) => {
  res.send('I am on GET /pixBattle/register')
})

Router.post('/register', (req, res) => {
  const sql = 'SELECT username, email FROM user WHERE email = ?'
  const username = req.body.username
  const email = req.body.email
  connection.query(sql, [email, username], (err, result) => {
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
          connection.query(sql, values, (err, results) => {
            if (err) throw err
            res.status(200).send(results)
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
          connection.query(sql, values, (err, results) => {
            if (err) throw err
            res.status(200).send(results)
          })
        })
      })
    } else {
      res.send('Tu es déjà inscrit')
    }
  })
})

module.exports = Router
