const express = require('express')

const connection = require('../helper/db')

const router = express.Router()

router.get('/', (req, res) => {
  const sql = 'SELECT * FROM user WHERE user_id = ?'
  const values = 1
  connection.query(sql, values, (err, res) => {
    if (err) throw err
    console.log('res est', res)
  })
})

module.exports = router
