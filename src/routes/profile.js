const express = require('express')

const checkToken = require('../helper/checkToken')
const connection = require('../helper/db')

const router = express.Router()

router.get('/', checkToken, (req, res) => {
  const sqlUserInfos = 'SELECT b.winner_user_id, count(b.winner_user_id) AS victories FROM user AS u JOIN battle AS b ON b.winner_user_id = u.user_id JOIN user_battle AS ub ON ub.user_id = u.user_id WHERE u.user_id = ? GROUP BY b.winner_user_id'
  const valueUserId = [req.user.userId]
  connection.query(sqlUserInfos, valueUserId, (err, userInfos) => {
    if (err) throw err
    if (!userInfos[0]) {
      const sqlNumberPhotosUser = 'SELECT count(*) AS nb_photos FROM photo WHERE user_id = ?'
      connection.query(sqlNumberPhotosUser, valueUserId, (err, nbPhotos) => {
        if (err) throw err
        const sqlNumberGroupsUser = 'SELECT count(*) AS nb_groups FROM user_group WHERE user_id = ?'
        connection.query(sqlNumberGroupsUser, valueUserId, (err, nbGroups) => {
          if (err) throw err
          const sqlNumberBattlesUser = 'SELECT count(*) AS nb_battles FROM user_battle WHERE user_id = ?'
          connection.query(sqlNumberBattlesUser, valueUserId, (err, nbBattles) => {
            if (err) throw err
            const allInfos = {
              nbPhotos,
              nbGroups,
              nbBattles
            }
            res.status(200).send(allInfos)
          })
        })
      })
    }
    if (userInfos[0]) {
      const infos = userInfos[0]
      const sqlNumberPhotosUser = 'SELECT count(*) AS nb_photos FROM photo WHERE user_id = ?'
      connection.query(sqlNumberPhotosUser, valueUserId, (err, nbPhotos) => {
        if (err) throw err
        const sqlNumberGroupsUser = 'SELECT count(*) AS nb_groups FROM user_group WHERE user_id = ?'
        connection.query(sqlNumberGroupsUser, valueUserId, (err, nbGroups) => {
          if (err) throw err
          const sqlNumberBattlesUser = 'SELECT count(*) AS nb_battles FROM user_battle WHERE user_id = ?'
          connection.query(sqlNumberBattlesUser, valueUserId, (err, nbBattles) => {
            if (err) throw err
            const allInfos = {
              infos,
              nbPhotos,
              nbGroups,
              nbBattles
            }
            res.status(200).send(allInfos)
          })
        })
      })
    }
  })
})

router.get('/my-ranking', checkToken, (req, res) => {
  const userId = [req.user.userId]
  const sql = 'SELECT * FROM user WHERE user_id = ?'
  connection.query(sql, userId, (err, result) => {
    if (err) throw err
    res.status(200).send(result)
  })
})

module.exports = router
