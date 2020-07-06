const express = require('express')
const router = express.Router()
const checkToken = require('../helper/checkToken')
const connection = require('../helper/db')
const multer = require('multer')



const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, '/Users/ariomega/Desktop/Pix_Battle/paris-react-2003-pjt3-pixbattle-back/uploads');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname)
  }
});

const upload = multer({storage: storage})
// const upload = multer({
//   dest: 'uploads/',
//   onError: function (err, next) {
//     console.log('error', err);
//     next(err);
//   }
// })



router.get('/', checkToken, (req, res) => {
  const sqlGroupName = 'SELECT group_name FROM `group` WHERE group_id = ?'
  const valueGroupId = [
    req.body.groupId
  ]
  connection.query(sqlGroupName, valueGroupId, (err, result) => {
    if (err) throw err
    const groupName = {
      groupName: result[0].group_name
    }
    const sqlBattleInfos = 'SELECT t.theme_name, b.deadline, r.rule_name FROM theme AS t JOIN battle AS b ON b.theme_id = t.theme_id JOIN battle_rule AS br ON br.battle_id = b.battle_id JOIN rule AS r ON r.rule_id = br.rule_id WHERE b.battle_id = ?'
    const valueBattleId = [
      req.body.battleId
    ]
    connection.query(sqlBattleInfos, valueBattleId, (err, battleInfos) => {
      if (err) throw err
      const sqlBattleMembers = 'SELECT u.username, u.user_id, a.avatar_url FROM avatar AS a JOIN user AS u ON u.avatar_id = a.avatar_id JOIN user_battle AS ub ON ub.user_id = u.user_id WHERE ub.battle_id = ?'
      connection.query(sqlBattleMembers, valueBattleId, (err, battleMembers) => {
        if (err) throw err
        const sqlMemberStatus = 'SELECT u.user_id FROM user AS u JOIN photo AS p ON p.user_id = u.user_id WHERE p.battle_id = ?'
        connection.query(sqlMemberStatus, valueBattleId, (err, battleMemberStatus) => {
          if (err) throw err
          const infos = {
            groupName,
            battleInfos,
            battleMembers,
            battleMemberStatus
          }
          res.status(200).send(infos)
        })
      })
    })
  })
})

router.post('/addpicture', upload.single('file'), (req, res) => {
  console.log(req.file)
  const sqlInsertPhoto = 'INSERT INTO photo (photo_url, create_date, user_id, battle_id, group_id) VALUES (?, NOW(), ?, ?, ?)'
  const valuesInsertPhoto = [
    req.body.photoUrl,
    req.body.userId,
    req.body.battleId,
    req.body.groupId
  ]
  connection.query(sqlInsertPhoto, valuesInsertPhoto, (err, photoRes) => {
    if (err) throw err
    const photoId = {
      photoId: photoRes.insertId
    }
    res.status(200).send(photoId)
  })
})

router.put('/', checkToken, (req, res) => {
  const sqlUpdatePhoto = 'UPDATE photo SET photo_url = ? WHERE photo_id = ?'
  const valuesUpdatePhoto = [
    req.body.photoUrl,
    req.body.photoId
  ]
  connection.query(sqlUpdatePhoto, valuesUpdatePhoto, err => {
    if (err) throw err
    res.sendStatus(200)
  })
})

router.delete('/', checkToken, (req, res) => {
  const sqlDeletePhoto = 'DELETE FROM photo WHERE photo_id = ?'
  const valueDeletePhoto = [
    req.body.photoId
  ]
  connection.query(sqlDeletePhoto, valueDeletePhoto, err => {
    if (err) throw err
    res.sendStatus(200)
  })
})

module.exports = router
