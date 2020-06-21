const express = require('express')
const jwt = require('jsonwebtoken')

const connection = require('../helper/db.js')
const { jwtSecret } = require('../../config.js')

const router = express.Router()

router.post('/:groupId', (req, res) => {
  const token = req.body.headers['x-access-token']
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) throw err
    const emails = req.body.allEmails
    emails.map(email => {
      const sql = 'SELECT user_id, username FROM user WHERE email = ?'
      const selectUserValues = [
        email
      ]
      connection.query(sql, selectUserValues, (err, result) => {
        if (err) throw err
        if (!result[0]) {
          const sql = 'INSERT INTO user (email, create_date) VALUES (?, NOW())'
          const insertUserValues = [
            email
          ]
          connection.query(sql, insertUserValues, (err, result) => {
            if (err) throw err
            if (result) {
              const sql = 'SELECT user_id FROM user WHERE email = ?'
              const selectUserGroupValues = [
                email
              ]
              connection.query(sql, selectUserGroupValues, (err, result) => {
                if (err) throw err
                if (result) {
                  const sql = 'INSERT INTO user_group VALUES (? , ?)'
                  const insertUserGroupValues = [
                    result[0].user_id,
                    req.params.groupId
                  ]
                  connection.query(sql, insertUserGroupValues, (err, result) => {
                    if (err) throw err
                    return res.status(200).send('youhou')
                  })
                }
              })
            }
          })
        } else {
          const sql = 'INSERT INTO user_group VALUES (? , ?)'
          const values = [
            result[0].user_id,
            req.params.groupId
          ]
          connection.query(sql, values, (err, result) => {
            if (err) throw err
            return res.status(200).send(result)
          })
        }
      })
    })
  })
})

router.put('/:groupId', (req, res) => {
  const token = req.body.headers['x-access-token']
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) throw err
    const sql = 'INSERT INTO user_group VALUES (?, ?)'
    const insertValues = [
      decoded.userId,
      req.params.groupId
    ]
    connection.query(sql, insertValues, (err, result) => {
      if (err) throw err
      if (result) {
        const sql = 'UPDATE `group` SET group_name = ? WHERE group_id = ?'
        const updateValues = [
          req.body.group_name,
          req.params.groupId
        ]
        connection.query(sql, updateValues, (err, result) => {
          if (err) throw err
          if (result) {
            res.status(200).send('youhou')
          }
        })
      }
    })
  })
})

module.exports = router
