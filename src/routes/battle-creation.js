const express = require('express')
const checkToken = require('../helper/checkToken')
const connection = require('../helper/db')

const router = express.Router()

router.get('/themes', checkToken, (req, res) => {
  const sql = 'SELECT * FROM theme ORDER BY RAND() LIMIT 10;'
  connection.query(sql, (err, themeList) => {
    if (err) throw err
    return res.status(201).send(themeList)
  })
})

router.get('/rules', checkToken, (req, res) => {
  const sql = 'SELECT * FROM rule;'
  connection.query(sql, (err, ruleList) => {
    if (err) throw err
    return res.status(201).send(ruleList)
  })
})

module.exports = router
