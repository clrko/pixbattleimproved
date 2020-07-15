const express = require('express')

const checkToken = require('../helper/checkToken')
const connection = require('../helper/db')

const router = express.Router()

router.get('/', (req, res) => {
  const sqlSelectParticipants =
    `SELECT p.photo_id, p.photo_url, p.create_date, u.username, u.user_id, a.avatar_url 
    FROM photo AS p 
    JOIN user AS u 
      ON u.user_id = p.user_id 
    JOIN avatar AS a 
      ON a.avatar_id = u.avatar_id 
    WHERE p.battle_id = ? 
    GROUP BY p.photo_id`
  const valueBattleId = [
    req.body.battleId
  ]
  connection.query(sqlSelectParticipants, valueBattleId, (err, allParticipants) => {
    if (err) throw err
    const sqlVictories =
      `SELECT b.winner_user_id, count(b.winner_user_id) AS victories 
      FROM user AS u 
      JOIN battle AS b 
        ON b.winner_user_id = u.user_id 
      JOIN user_battle AS ub 
        ON ub.user_id = u.user_id 
      JOIN battle AS ba 
        ON ba.battle_id = ub.battle_id 
      WHERE ba.battle_id = ? 
      GROUP BY b.winner_user_id`
    connection.query(sqlVictories, valueBattleId, (err, allVictories) => {
      if (err) throw err
      const sqlHasVoted =
        `SELECT u.user_id 
        FROM user AS u 
        JOIN user_photo AS up 
          ON up.user_id = u.user_id 
        JOIN photo AS p 
          ON p.photo_id = up.photo_id 
        WHERE battle_id = ?`
      connection.query(sqlHasVoted, valueBattleId, (err, allHasVoted) => {
        if (err) throw err
        const allInfos = {
          allParticipants,
          allVictories,
          allHasVoted
        }
        res.status(200).send(allInfos)
      })
    })
  })
})

router.post('/', checkToken, (req, res) => {
  const sqlPostVote =
    `INSERT INTO user_photo 
      (user_id, photo_id, vote) 
    VALUES 
      (?, ?, ?), 
      (?, ?, ?), 
      (?, ?, ?)`
  const valuesPostVote = [
    req.user.userId,
    req.body.photoId1,
    req.body.vote1,
    req.user.userId,
    req.body.photoId2,
    req.body.vote2,
    req.user.userId,
    req.body.photoId3,
    req.body.vote3
  ]
  connection.query(sqlPostVote, valuesPostVote, err => {
    if (err) throw err
    res.sendStatus(201)
  })
})

module.exports = router
