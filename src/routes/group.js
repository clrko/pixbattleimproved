const express = require('express')

const checkToken = require('../helper/ckeckToken')
const connection = require('../helper/db')

const router = express.Router()

// Sur la page de création du groupe
router.post('/:groupId', checkToken, (req, res) => {
  const emails = req.body.allEmails
  // Récupère tu front un tableau d'email et pour chaque email, effectue la requête
  // emails.map(email => {
  // Au lieu de lancer "en parallèle" tout ça:
  // SELECT user_id, username FROM user WHERE email = ${email}
  // SELECT user_id, username FROM user WHERE email = 'mary@example.com'
  // SELECT user_id, username FROM user WHERE email IN('john@example.com', 'mary@example.com')
  // 1. Requeter TOUS les users par leur email d' un coup
  // `SELECT user_id, username FROM user WHERE email IN(${emails.map(_ => '?')})`
  // avec selectUserValues = emails
  // Cree un tableau avec autant d'elements que d'emails, le remplit de ?
  const placeholders = new Array(emails.length).fill('?')
  const sql = `SELECT user_id, email FROM user WHERE email IN(${placeholders})`
  connection.query(sql, emails, (err, existingUsers) => {
    if (err) throw err
    // 2. tous les users de existingUsers sont des comptes existants
    // Il va falloir trouver les emails pour lesquels aucun compte n'existe
    const existingEmails = existingUsers.map(user => user.email)
    const nonExistingEmails = emails.filter(email => !existingEmails.includes(email))
    // 3. Maintenant qu' on a bien separe les "existants" de "non-existants",
    // on va faire des "insertions en bloc":
    // INSERT INTO(email, name) VALUES('sss@asd.co', 'www'),('aaa@asd.we', 'as');
    // https://stackoverflow.com/q/8899802/
    // pour ceux n'existant pas: values = [[email1], [email2], [email3]]
    // ALTER TABLE user MODIFY COLUMN create_date DATETIME DEFAULT CURRENT_TIMESTAMP;
    // Si pas de résultat === création en BD d'un nouvel user
    // if (!result[0]) {
    const sql = 'INSERT INTO user (email) VALUES ?'
    const insertUserValues = nonExistingEmails.map(e => [e])
    connection.query(sql, [insertUserValues], err => {
      if (err) throw err
      const sql = `SELECT user_id FROM user WHERE email IN(${placeholders})`
      connection.query(sql, emails, (err, allUserIds) => {
        // allUserIds: [{ user_id: 1 }, { user_id: 2 }, { user_id: 3 }]
        if (err) throw err
        // Insertion de l'id des users invités dans user_group
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
  // Insertion dans user_group de l'id du groupe créé et de l'id du créateur du groupe
  const sql = 'INSERT INTO user_group VALUES (?, ?)'
  const insertValues = [
    req.user.userId,
    req.params.groupId
  ]
  connection.query(sql, insertValues, err => {
    if (err) throw err
    // Mise à jour du groupe avec le nom choisis par l'utilisateur
    const sql = 'UPDATE `group` SET group_name = ? WHERE group_id = ?'
    const updateValues = [
      req.body.groupName,
      req.params.groupId
    ]
    connection.query(sql, updateValues, err => {
      if (err) throw err
      res.status(200).send('youhou2')
    })
  })
})

// router.delete('/:groupId', (req, res) => {
//   const token = req.body.headers['x-access-token']
//   jwt.verify(token, jwtSecret, (err, decoded) => {
//     if (err) throw err
//     const sql = 'DELETE FROM `group` WHERE group_id = ?'
//     const values = [
//       req.params.groupId
//     ]
//     connection.query(sql, values, (err, result) => {
//       if (err) throw err
//       if (result) {
//         console.log(sql, values, result)
//       }
//     })
//   })
// })

module.exports = router
