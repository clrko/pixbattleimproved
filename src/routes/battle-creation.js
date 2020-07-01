const express = require('express')

/* const checkToken = require('../helper/checkToken') */
const connection = require('../helper/db')

const router = express.Router()
// ajouter checktoken
router.get('/themes', (req, res) => {
  const sql = 'SELECT * FROM theme ORDER BY RAND() LIMIT 10;'
  connection.query(sql, (err, themeList) => {
    if (err) throw err
    return res.status(200).send(themeList)
  })
})

router.get('/rules', (req, res) => {
  const sql = 'SELECT * FROM rule;'
  connection.query(sql, (err, ruleList) => {
    if (err) throw err
    return res.status(200).send(ruleList)
  })
})

module.exports = router
