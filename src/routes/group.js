const express = require('express')
const jwt = require('jsonwebtoken')

const connection = require('../helper/db.js')
const { jwtSecret } = require('../../config.js')

const Router = express.Router()

Router.post('/', (req, res) => {
  const token = req.headers['x-access-token']
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) throw err
    const sql = 'SELECT user_id, username FROM user WHERE email = ?'
    const values = [
      req.body.email,
      decoded.groupId
    ]
    connection.query(sql, values, (err, result) => {
      if (err) throw err
      if (!result[0]) {
        const sql = 'INSERT INTO user (email, create_date) VALUES (?, NOW())'
        const values = [
          req.body.email
        ]
        connection.query(sql, values, (err, result) => {
          if (err) throw err
          if (result) {
            const sql = 'SELECT user_id FROM user WHERE email = ?'
            const values = [
              req.body.email
            ]
            connection.query(sql, values, (err, result) => {
              if (err) throw err
              if (result) {
                const sql = 'INSERT INTO user_group VALUES (? , ?)'
                const values = [
                  result[0].user_id,
                  decoded.groupId
                ]
                connection.query(sql, values, (err, result) => {
                  if (err) throw err
                  return res.status(200).send(result)
                })
              }
            })
          }
        })
      } else {
        const sql = 'INSERT INTO user_group VALUES (? , ?)'
        const values = [
          result[0].user_id,
          decoded.groupId
        ]
        connection.query(sql, values, (err, result) => {
          if (err) throw err
          return res.status(200).send(result)
        })
      }
    })
  })
})

Router.put('/', (req, res) => {
  const token = req.headers['x-access-token']
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) throw err
    const sql = 'INSERT INTO user_group VALUES (?, ?)'
    const values = [
      decoded.adminId,
      decoded.groupId
    ]
    connection.query(sql, values, (err, result) => {
      if (err) throw err
      if (result) {
        const sql = 'UPDATE `group` SET group_name = ? WHERE group_id = ?'
        const values = [
          req.body.group_name,
          decoded.groupId
        ]
        connection.query(sql, values, (err, result) => {
          if (err) throw err
          if (result) {
            res.status(200).send('youhou')
          }
        })
      }
    })
  })
})

module.exports = Router
