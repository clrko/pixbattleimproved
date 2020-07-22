const express = require('express')
const router = express.Router()

const checkToken = require('../helper/checkToken')
const connection = require('../helper/db')
const eventEmitterMail = require('../helper/eventEmitterMail')
const { encrypt } = require('../helper/encryptionCode')

// Sur la page de création du groupe
router.post('/:groupId', checkToken, (req, res) => {
  const emails = req.body.allEmails
  const invitationCode = encrypt(`group${req.params.groupId}`)
  eventEmitterMail.emit('sendMail', { type: 'invite', to: emails, subject: `Rejoins le groupe de ${req.user.username}`, invitationCode: invitationCode })
  return res.sendStatus(200)
})

// Au moment du choix du nom du groupe
router.put('/:groupId', checkToken, (req, res) => {
  const sql = 'INSERT INTO user_group VALUES (?, ?)'
  const insertValues = [
    req.user.userId,
    req.params.groupId
  ]
  connection.query(sql, insertValues, err => {
    if (err) throw err
    const sql = 'UPDATE `group` SET group_name = ? WHERE group_id = ?'
    const updateValues = [
      req.body.groupName,
      req.params.groupId
    ]
    connection.query(sql, updateValues, err => {
      if (err) throw err
      res.sendStatus(200)
    })
  })
})

router.delete('/:groupId', checkToken, (req, res) => {
  const sql = 'DELETE FROM `group` WHERE group_id = ?'
  const values = [
    req.params.groupId
  ]
  connection.query(sql, values, err => {
    if (err) throw err
    return res.sendStatus(200)
  })
})

// Group General Information
router.get('/my-groups', checkToken, (req, res) => {
  const sqlGetGroupInformation =
    `SELECT 
    gr.group_id, 
    gr.group_name, 
    gr.admin_user_id, 
    SUM(CASE WHEN b.status_id = 1 OR b.status_id = 2 THEN 1 ELSE 0 END) AS ongoingBattles,
    SUM(CASE WHEN b.status_id = 3 THEN 1 ELSE 0 END) AS finishedBattles,
      gu.group_users AS groupMembers
    FROM \`group\` AS gr
    INNER JOIN battle AS b
      ON gr.group_id = b.group_id
    INNER JOIN (SELECT ug.group_id AS group_id, COUNT(ug.user_id) AS group_users FROM user_group AS ug GROUP BY ug.group_id) AS gu
      ON gu.group_id = gr.group_id
    WHERE gr.group_id IN (SELECT (ug.group_id) FROM user_group AS ug WHERE ug.user_id = ?)
    GROUP BY gr.group_id`
  connection.query(sqlGetGroupInformation, req.user.userId, (err, userGroupInformation) => {
    if (err) throw err
    res.status(200).send(userGroupInformation)
  })
})

module.exports = router
