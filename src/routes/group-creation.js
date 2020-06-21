const express = require('express')
const jwt = require('jsonwebtoken')

const connection = require('../helper/db.js')
const { jwtSecret } = require('../../config.js')

const router = express.Router()

router.get('/', (req, res) => {
  res.send('I am on GET /group-creation')
})

router.post('/', (req, res) => {
  const token = req.body.headers['x-access-token']
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) throw err
    const sql = 'INSERT INTO `group` (create_date, admin_user_id) VALUES (NOW(), ?)'
    const insertValues = [
      decoded.userId
    ]
    connection.query(sql, insertValues, (err, result2) => {
      if (err) throw err
      if (result2) {
        const sql = 'SELECT group_id FROM `group` WHERE admin_user_id = ? ORDER BY group_id DESC LIMIT 1'
        const selectValues = [
          decoded.userId
        ]
        connection.query(sql, selectValues, (err, result) => {
          if (err) throw err
          if (result) {
            const groupId = {
              groupId: result[0].group_id
            }
            res.status(200).send(groupId)
          }
        })
      }
    })
  })
})

module.exports = router
