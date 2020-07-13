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
    const sql = 'INSERT INTO user (email) VALUES (?)'
    const insertUserValues = nonExistingEmails.map(e => [e])
    connection.query(sql, [insertUserValues], err => {
      if (err) throw err
      const sql = `SELECT user_id FROM user WHERE email IN(${placeholders})`
      connection.query(sql, emails, (err, allUserIds) => {
        if (err) throw err
        const sql = 'INSERT INTO user_group (user_id, group_id) VALUES (?)'
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

module.exports = router
