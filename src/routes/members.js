const express = require('express')
const router = express.Router()

const checkToken = require('../helper/checkToken')
const connection = require('../helper/db')

router.get('/group/:groupId', checkToken, (req, res) => {
  const sqlGetListMembers =
  `SELECT u.user_id, u.username, u.email, a.avatar_url 
  FROM user AS u
  JOIN avatar AS a
    ON u.avatar_id = a.avatar_id
  JOIN user_group AS ug
    ON u.user_id = ug.user_id
  WHERE ug.group_id = ?`
  connection.query(sqlGetListMembers, req.params.groupId, (err, listMembers) => {
    if (err) throw err
    return res.status(200).send(listMembers)
  })
})

router.delete('/:userId/group/:groupId', checkToken, (req, res) => {
  const sqlDeleteMember = 'DELETE FROM user_group WHERE group_id = ? AND user_id = ?'
  const deleteValues = [
    req.params.groupId,
    req.params.userId
  ]
  connection.query(sqlDeleteMember, deleteValues, err => {
    if (err) throw err
    const sqlGetListMembers =
    `SELECT u.user_id, u.username, u.email, a.avatar_url 
    FROM user AS u
    JOIN avatar AS a
      ON u.avatar_id = a.avatar_id
    JOIN user_group AS ug
      ON u.user_id = ug.user_id
    WHERE ug.group_id = ?`
    connection.query(sqlGetListMembers, req.params.groupId, (err, listMembers) => {
      if (err) throw err
      return res.status(200).send(listMembers)
    })
  })
})

module.exports = router
