const express = require('express')
/* const checkToken = require('../helper/checkToken') */
const connection = require('../helper/db')

const router = express.Router()

router.get('/themes', /* checkToken, */ (req, res) => {
  const sql = 'SELECT * FROM theme ORDER BY RAND() LIMIT 10;'
  connection.query(sql, (err, themeList) => {
    if (err) throw err
    return res.status(201).send(themeList)
  })
})

router.get('/rules', /* checkToken, */ (req, res) => {
  const sql = 'SELECT * FROM rule;'
  connection.query(sql, (err, ruleList) => {
    if (err) throw err
    return res.status(201).send(ruleList)
  })
})

router.post('/', /* checkToken, */ (req, res) => {
  const userId = 1
  const sql = 'INSERT INTO battle (deadline, group_id, theme_id, admin_user_id) VALUES (?, ?, ?, ?)'
  const value = [
    req.body.deadline,
    req.body.groupId,
    req.body.themeId,
    userId
  ]
  console.log(value)
  connection.query(sql, value, (err, battleCreationResult) => {
    if (err) throw err
    const sqlBattleRule = 'INSERT INTO battle_rule VALUES ?'
    const insertBattleRulesValues = req.body.rulesId.map(rule => [battleCreationResult.insertId, rule])
    connection.query(sqlBattleRule, [insertBattleRulesValues], err => {
      if (err) throw err
      return res.sendStatus(201)
    })
    const sqlUserBattle = 'INSERT INTO user_battle VALUES (?, ?)'
    const userBattleValues = [
      userId,
      battleCreationResult.insertId
    ]
    connection.query(sqlUserBattle, userBattleValues, err => {
      if (err) throw err
      return res.sendStatus(201)
    })
  })
})

module.exports = router
