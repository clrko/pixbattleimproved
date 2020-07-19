const express = require('express')

const checkToken = require('../helper/checkToken')
const connection = require('../helper/db')

const router = express.Router()

// Sur la page de création du groupe
router.post('/:groupId', checkToken, (req, res) => {
  const emails = req.body.allEmails
  const placeholders = new Array(emails.length).fill('?')
  const sql = `SELECT user_id, email FROM user WHERE email IN(${placeholders})`
  connection.query(sql, emails, (err, existingUsers) => {
    if (err) throw err
    const existingEmails = existingUsers.map(user => user.email)
    const nonExistingEmails = emails.filter(email => !existingEmails.includes(email))
    const sql = nonExistingEmails.length > 0 ? 'INSERT INTO user (email) VALUES ?' : 'SELECT 1'
    const insertUserValues = nonExistingEmails.map(e => [e])
    connection.query(sql, [insertUserValues], err => {
      if (err) throw err
      const sql = `SELECT user_id FROM user WHERE email IN(${placeholders})`
      connection.query(sql, emails, (err, allUserIds) => {
        if (err) throw err
        const sql = 'INSERT INTO user_group (user_id, group_id) VALUES ?'
        const insertUserGroupValues = allUserIds.map(user => [user.user_id, req.params.groupId])
        connection.query(sql, [insertUserGroupValues], err => {
          if (err) throw err
          return res.sendStatus(200)
        })
      })
    })
  })
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
      COUNT(ug.user_id) AS groupMembers
    FROM \`group\` AS gr
    JOIN battle AS b
      ON gr.group_id = b.group_id
    JOIN user_group AS ug
      ON gr.group_id = ug.group_id
    WHERE gr.group_id IN (SELECT (ug.group_id) FROM user_group AS ug WHERE ug.user_id = ?)
    GROUP BY gr.group_id`
  connection.query(sqlGetGroupInformation, req.user.userId, (err, userGroupInformation) => {
    if (err) throw err
    res.status(200).send(userGroupInformation)
  })
})

module.exports = router
