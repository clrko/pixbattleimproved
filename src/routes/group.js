const express = require('express')
const router = express.Router()

const checkToken = require('../helper/checkToken')
const connection = require('../helper/db')
const eventEmitterMail = require('../helper/eventEmitterMail')
const { encrypt } = require('../helper/encryptionCode')

router.delete('/:groupId', checkToken, (req, res, next) => {
  const sql = 'DELETE FROM `group` WHERE group_id = ?'
  const values = [
    req.params.groupId
  ]
  connection.query(sql, values, err => {
    if (err) return next(err)
    return res.sendStatus(200)
  })
})

// Group General Information
router.get('/my-groups', checkToken, (req, res, next) => {
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
    if (err) return next(err)
    res.status(200).send(userGroupInformation)
  })
})

// Modified group name
router.put('/update/:groupId', checkToken, (req, res, next) => {
  const sql = 'UPDATE `group` SET group_name = ? WHERE group_id = ?'
  const insertValues = [
    req.body.groupName,
    req.params.groupId
  ]
  connection.query(sql, insertValues, err => {
    if (err) return next(err)
    return res.sendStatus(200)
  })
})

// Add group participants
router.post('/add-members/:groupId', checkToken, (req, res, next) => {
  const emails = req.body.allEmails
  const userName = req.user.username
  const groupId = req.params.groupId
  const invitationCode = encrypt(`group${groupId}`)
  eventEmitterMail.emit('sendMail', { type: 'invitation', to: emails, subject: `Rejoins le groupe de ${userName}`, invitationCode, userName })
  return res.sendStatus(200)
})

module.exports = router
