const express = require('express')

const checkToken = require('../helper/checkToken')
const connection = require('../helper/db')

const router = express.Router()

router.post('/', checkToken, (req, res) => {
  const sqlUserInfos = 'SELECT b.winner_user_id, count(b.winner_user_id) AS victories FROM avatar AS a JOIN user AS u ON a.avatar_id = u.avatar_id JOIN battle AS b ON b.winner_user_id = u.user_id JOIN user_battle AS ub ON ub.user_id = u.user_id WHERE u.user_id = ? GROUP BY b.winner_user_id'
  const valueUserId = [req.user.userId]
  connection.query(sqlUserInfos, valueUserId, (err, userInfos) => {
    if (err) throw err
    if (!userInfos[0]) {
      const sqlUserInfosEmpty = 'SELECT u.username, a.avatar_url FROM avatar AS a JOIN user AS u ON a.avatar_id = u.avatar_id WHERE u.user_id = ?'
      connection.query(sqlUserInfosEmpty, valueUserId, err => {
        if (err) throw err
        return res.status(200)
      })
    } else {
      return res.status(200).send(userInfos[0])
    }
  })
})

module.exports = router
