const express = require('express')

const checkToken = require('../helper/checkToken')
const connection = require('../helper/db')

const router = express.Router()

// Quand l'utilisateur clique sur le bouton 'Créer un groupe' sur la page profil
router.post('/', checkToken, (req, res) => {
  const sql = 'INSERT INTO `group` (admin_user_id) VALUES (?)'
  const values = [
    req.user.userId
  ]
  connection.query(sql, values, err => {
    if (err) throw err
    const sql = 'SELECT group_id FROM `group` WHERE admin_user_id = ? ORDER BY group_id DESC LIMIT 1'
    connection.query(sql, values, (err, result) => {
      if (err) throw err
      const groupId = {
        groupId: result[0].group_id
      }
      res.status(200).send(groupId)
    })
  })
})

module.exports = router
