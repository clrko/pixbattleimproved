const express = require('express')
const jwt = require('jsonwebtoken')

const connection = require('../helper/db.js')
const { jwtSecret } = require('../../config.js')

const Router = express.Router()

Router.get('/', (req, res) => {
  res.send('I am on GET /group-creation')
})

Router.post('/', (req, res) => {
  const token = req.headers['x-access-token']
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) throw err
    const sql = 'INSERT INTO `group` (create_date, admin_user_id) VALUES (NOW(), ?)'
    const values = [
      decoded.userId
    ]
    connection.query(sql, values, (err, result) => {
      if (err) throw err
      const sql = 'SELECT group_id FROM `group` WHERE admin_user_id = ? ORDER BY group_id DESC LIMIT 1'
      const values = [
        decoded.userId
      ]
      connection.query(sql, values, (err, result) => {
        if (err) throw err
        if (result) {
          const tokenGroupInfo = {
            adminId: decoded.userId,
            groupId: result[0].group_id
          }
          const token = jwt.sign(tokenGroupInfo, jwtSecret)
          res.header('Access-Control-Expose-Headers', 'x-access-token')
          res.set('x-access-token', token)
          res.status(200).send(tokenGroupInfo)
        }
      })
    })
  })
})

module.exports = Router
