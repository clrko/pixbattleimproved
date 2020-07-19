const express = require('express')

const connection = require('../helper/db')
const checkToken = require('../helper/checkToken')

const router = express.Router()

router.post('/battle', (req, res) => {
  const sqlPhotosBattle = 'SELECT * FROM photo AS p JOIN battle AS b ON b.battle_id = p.battle_id WHERE b.battle_id = ?'
  const battleId = [req.body.battleId]
  connection.query(sqlPhotosBattle, battleId, (err, photosBattleUrls) => {
    if (err) throw err
    res.status(200).send(photosBattleUrls)
  })
})

router.get('/group', (req, res) => {
  const sqlPhotosGroup = 'SELECT  * FROM photo AS p JOIN `group` AS g ON g.group_id = p.group_id WHERE g.group_id = ?'
  const groupId = [req.body.groupId]
  connection.query(sqlPhotosGroup, groupId, (err, photosGroupUrls) => {
    if (err) throw err
    res.status(200).send(photosGroupUrls)
  })
})

router.get('/user/:userId', checkToken, (req, res) => {
  const sqlPhotosUser = 'SELECT * FROM photo WHERE user_id = ?'
  const userId = [req.user.userId]
  console.log(userId)
  connection.query(sqlPhotosUser, userId, (err, photosUserUrls) => {
    if (err) throw err
    res.status(200).send(photosUserUrls)
  })
})

module.exports = router
