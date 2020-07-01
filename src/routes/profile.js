const express = require('express')

// const checkToken = require('../helper/checkToken')
const connection = require('../helper/db')

const router = express.Router()

router.get('/', (req, res) => {
  const sqlUserInfos = 'SELECT u.username, a.avatar_url, b.winner_user_id, count(b.winner_user_id) AS victories FROM avatar AS a JOIN user AS u ON a.avatar_id = u.avatar_id JOIN battle AS b ON b.winner_user_id = u.user_id JOIN user_battle AS ub ON ub.user_id = u.user_id WHERE u.user_id = ? GROUP BY b.winner_user_id'
  const valueUserId = [req.body.userId]
  connection.query(sqlUserInfos, valueUserId, (err, userInfos) => {
    if (err) throw err
    if (!userInfos[0]) {
      const sqlUserInfosEmpty = 'SELECT u.username, a.avatar_url FROM avatar AS a JOIN user AS u ON a.avatar_id = u.avatar_id WHERE u.user_id = ?'
      connection.query(sqlUserInfosEmpty, valueUserId, (err, userInfos) => {
        if (err) throw err
        return res.status(200).send(userInfos[0])
      })
    } else {
      return res.status(200).send(userInfos[0])
    }
  })
})

router.get('/nbPhotos', (req, res) => {
  const sqlNumberPhotosUser = 'SELECT count(*) AS nb_photos FROM photo WHERE user_id = ?'
  const valueUserId = [req.body.userId]
  connection.query(sqlNumberPhotosUser, valueUserId, (err, nbPhotos) => {
    if (err) throw err
    res.status(200).send(nbPhotos)
  })
})

router.get('/nbGroups', (req, res) => {
  const sqlNumberGroupsUser = 'SELECT count(*) AS nb_groups FROM user_group WHERE user_id = ?'
  const valueUserId = [req.body.userId]
  connection.query(sqlNumberGroupsUser, valueUserId, (err, nbGroups) => {
    if (err) throw err
    res.status(200).send(nbGroups)
  })
})

router.get('/nbBattles', (req, res) => {
  const sqlNumberBattlesUser = 'SELECT count(*) AS nb_battles FROM user_battle WHERE user_id = 2'
  const valueUserId = [req.body.userId]
  connection.query(sqlNumberBattlesUser, valueUserId, (err, nbBattles) => {
    if (err) throw err
    res.status(200).send(nbBattles)
  })
})

module.exports = router
