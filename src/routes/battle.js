const express = require('express')
const router = express.Router()
const checkToken = require('../helper/checkToken')
const connection = require('../helper/db')
const multer = require('multer')

// Battle Creation
router.get('/battle-creation/themes', (req, res) => {
  const sql = 'SELECT * FROM theme ORDER BY RAND() LIMIT 10;'
  connection.query(sql, (err, themeList) => {
    if (err) throw err
    return res.status(201).send(themeList)
  })
})

router.get('/battle-creation/rules', (req, res) => {
  const sql = 'SELECT * FROM rule;'
  connection.query(sql, (err, ruleList) => {
    if (err) throw err
    return res.status(201).send(ruleList)
  })
})

router.post('/battle-creation', checkToken, (req, res) => {
  const userId = req.user.userId
  const sql = 'INSERT INTO battle (deadline, group_id, theme_id, admin_user_id, status_id) VALUES (?, ?, ?, ?, 1)'
  const value = [
    req.body.deadline,
    req.body.groupId,
    req.body.themeId,
    userId
  ]
  connection.query(sql, value, (err, battleCreationResult) => {
    if (err) throw err
    const createdBattleId = battleCreationResult.insertId
    const sqlBattleRule = 'INSERT INTO battle_rule VALUES ?'
    const insertBattleRulesValues = req.body.rulesId.map(rule => [createdBattleId, rule])
    connection.query(sqlBattleRule, [insertBattleRulesValues], err => {
      if (err) throw err
      const sqlUserBattle = 'INSERT INTO user_battle VALUES (?, ?)'
      const userBattleValues = [
        userId,
        createdBattleId
      ]
      connection.query(sqlUserBattle, userBattleValues, err => {
        if (err) throw err
        return res.status(201).send({ battleId: createdBattleId })
      })
    })
  })
})

// Battle Post
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsPath = process.env.PICS_UPLOADS_PATH || 'uploads'
    cb(null, uploadsPath)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true)
  } else {
    cb(new Error('This type of file is not supported'), null, false)
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: process.env.PICS_UPLOADS_MAX_SIZE ? Number(process.env.PICS_UPLOADS_MAX_SIZE) : 1024 * 1024 * 5
  },
  fileFilter: fileFilter
})

router.get('/battle-post/:groupId/:battleId', checkToken, (req, res) => {
  const sqlGroupName = 'SELECT group_name FROM `group` WHERE group_id = ?'
  const valueGroupId = [
    req.params.groupId
  ]
  connection.query(sqlGroupName, valueGroupId, (err, result) => {
    if (err) throw err
    const groupName = {
      groupName: result[0].group_name
    }
    const sqlBattleInfos =
      `SELECT t.theme_name, b.deadline, r.rule_name 
      FROM theme AS t 
      JOIN battle AS b 
        ON b.theme_id = t.theme_id 
      JOIN battle_rule AS br
        ON br.battle_id = b.battle_id 
      JOIN rule AS r 
        ON r.rule_id = br.rule_id 
      WHERE b.battle_id = ?`
    const valueBattleId = [
      req.params.battleId
    ]
    connection.query(sqlBattleInfos, valueBattleId, (err, battleInfos) => {
      if (err) throw err
      const sqlBattleMembers =
        `SELECT u.username, u.user_id, a.avatar_url 
        FROM avatar AS a 
        JOIN user AS u 
          ON u.avatar_id = a.avatar_id 
        JOIN user_battle AS ub 
          ON ub.user_id = u.user_id 
        WHERE ub.battle_id = ?`
      connection.query(sqlBattleMembers, valueBattleId, (err, battleMembers) => {
        if (err) throw err
        const sqlMemberStatus =
          `SELECT u.user_id 
          FROM user AS u 
          JOIN photo AS p 
            ON p.user_id = u.user_id 
          WHERE p.battle_id = ?`
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

router.post('/battle-post/addpicture', checkToken, upload.single('file'), (req, res) => {
  const sqlInsertPhoto = 'INSERT INTO photo (photo_url, user_id, battle_id, group_id) VALUES (?, ?, ?, ?)'
  const valuesInsertPhoto = [
    req.file.filename,
    req.user.userId,
    req.body.battleId,
    req.body.groupId
  ]
  connection.query(sqlInsertPhoto, valuesInsertPhoto, (err, photoRes) => {
    if (err) throw err
    const photoId = {
      photoId: photoRes.insertId
    }
    res.status(201).send(photoId)
  })
})

router.put('/battle-post/:photoId', checkToken, (req, res) => {
  const sqlUpdatePhoto = 'UPDATE photo SET photo_url = ? WHERE photo_id = ?'
  const valuesUpdatePhoto = [
    req.body.photoUrl,
    req.params.photoId
  ]
  connection.query(sqlUpdatePhoto, valuesUpdatePhoto, err => {
    if (err) throw err
    res.sendStatus(200)
  })
})

router.delete('/battle-post', checkToken, (req, res) => {
  const sqlDeletePhoto = 'DELETE FROM photo WHERE photo_id = ?'
  const valueDeletePhoto = [
    req.body.photoId
  ]
  connection.query(sqlDeletePhoto, valueDeletePhoto, err => {
    if (err) throw err
    res.sendStatus(200)
  })
})

// Battle Vote

router.get('/battle-vote', (req, res) => {
  const sqlSelectParticipants =
    `SELECT p.photo_id, p.photo_url, p.create_date, u.username, u.user_id, a.avatar_url 
    FROM photo AS p 
    JOIN user AS u 
      ON u.user_id = p.user_id 
    JOIN avatar AS a 
      ON a.avatar_id = u.avatar_id 
    WHERE p.battle_id = ? 
    GROUP BY p.photo_id`
  const valueBattleId = [
    req.body.battleId
  ]
  connection.query(sqlSelectParticipants, valueBattleId, (err, allParticipants) => {
    if (err) throw err
    const sqlVictories =
      `SELECT b.winner_user_id, count(b.winner_user_id) AS victories 
      FROM user AS u 
      JOIN battle AS b 
        ON b.winner_user_id = u.user_id 
      JOIN user_battle AS ub 
        ON ub.user_id = u.user_id 
      JOIN battle AS ba 
        ON ba.battle_id = ub.battle_id 
      WHERE ba.battle_id = ? 
      GROUP BY b.winner_user_id`
    connection.query(sqlVictories, valueBattleId, (err, allVictories) => {
      if (err) throw err
      const sqlHasVoted =
        `SELECT u.user_id 
        FROM user AS u 
        JOIN user_photo AS up 
          ON up.user_id = u.user_id 
        JOIN photo AS p 
          ON p.photo_id = up.photo_id 
        WHERE battle_id = ?`
      connection.query(sqlHasVoted, valueBattleId, (err, allHasVoted) => {
        if (err) throw err
        const allInfos = {
          allParticipants,
          allVictories,
          allHasVoted
        }
        res.status(200).send(allInfos)
      })
    })
  })
})

router.post('/battle-vote/status-user', checkToken, (req, res) => {
  const sql =
    `SELECT p.photo_id, p.photo_url, up.vote
    FROM user_photo AS up
    JOIN photo AS p
    ON p.photo_id = up.photo_id
    WHERE up.user_id = ?
    AND p.battle_id = ?`
  const values = [
    req.user.userId,
    req.body.battleId
  ]
  connection.query(sql, values, (err, result) => {
    if (err) throw err
    if (!result) {
      res.status(200).send('nothing')
    }
    res.status(200).send(result)
  })
})

router.post('/battle-vote', checkToken, (req, res) => {
  const sqlPostVote =
    `INSERT INTO user_photo 
      (user_id, photo_id, vote) 
    VALUES 
      (?, ?, ?), 
      (?, ?, ?), 
      (?, ?, ?)`
  const valuesPostVote = [
    req.user.userId,
    req.body.photoId1,
    req.body.vote1,
    req.user.userId,
    req.body.photoId2,
    req.body.vote2,
    req.user.userId,
    req.body.photoId3,
    req.body.vote3
  ]
  connection.query(sqlPostVote, valuesPostVote, err => {
    if (err) throw err
    res.sendStatus(201)
  })
})

// Battle Results
router.put('/results', (req, res) => {
  // const battleId = [req.body.battleId]
  // const sql = 'SELECT photo_id FROM photo WHERE battle_id = ?'
  // connection.query(sql, battleId, (err, results) => {
  //   if (err) throw err
  //   const ids = results.map(p => [p.photo_id])
  //   const sql2 =
  //     `UPDATE photo SET score = (SELECT SUM(vote) FROM user_photo WHERE photo_id = ?) WHERE photo_id = ?`
  //   values = [[ids], [ids]]
  //   connection.query(sql2, values, (err, results2) => {
  //     if (err) throw err
  //     console.log(results2)
  //     res.sendStatus(200)
  //   })
  // })
  const sqlGetScore =
    `SELECT up.photo_id, p.create_date AS date, COUNT(up.vote) AS nbVote, SUM(up.vote) AS score 
      FROM user_photo AS up 
      JOIN photo AS p 
        ON up.photo_id = p.photo_id 
      WHERE p.battle_id = ?
      GROUP BY up.photo_id`
  const battleId = [req.body.battleId]
  connection.query(sqlGetScore, battleId, (err, allInfos) => {
    if (err) throw err
    const infos = { allInfos }
    // const infosToUpdate = allInfos.map(info => [info.photoId, info.score])
    const scoresToUpdate = allInfos.map(s => [s.score])
    const photoIdToUpdate = allInfos.map(i => [i.photo_id])
    const placeholders = new Array(infos.length).fill('?')
    const valuesToUpdate = [scoresToUpdate, photoIdToUpdate]
    const sqlToUpdate = `UPDATE photo SET score IN(${placeholders}) WHERE photo_id IN(${placeholders})`
    console.log(scoresToUpdate, photoIdToUpdate)
    connection.query(sqlToUpdate, [valuesToUpdate], (err, result57) => {
      if (err) throw err
      res.status(200).send(result57)
    })
  })
})

router.get('/:battleId/results', (req, res) => {
  const battleId = req.params.battleId
  const sqlGetScore =
    `SELECT up.photo_id, u.username, u.user_id, a.avatar_url, p.photo_url ,p.create_date AS date, COUNT(up.vote) AS nbVote, SUM(up.vote) AS score 
    FROM avatar AS a
      JOIN user AS u
      ON u.avatar_id = a.avatar_id
        JOIN user_photo AS up 
        ON up.user_id = u.user_id
        JOIN photo AS p 
          ON up.photo_id = p.photo_id 
        WHERE p.battle_id = ?
        GROUP BY up.photo_id, u.user_id`
  connection.query(sqlGetScore, battleId, (err, scores) => {
    if (err) throw err
    res.status(200).send(scores)
  })
})

// Battle General information
router.get('/my-battles', checkToken, (req, res) => {
  const sqlGetBattleInformation =
    `SELECT b.battle_id, t.theme_name, b.deadline, b.create_date, b.admin_user_id, gr.group_name, gr.group_id, st.status_name
        FROM battle AS b
        JOIN theme AS t
        ON b.theme_id = t.theme_id
        JOIN \`group\` AS gr
      ON b.group_id = gr.group_id
    JOIN \`status\` AS st
      ON b.status_id = st.status_id
    JOIN user_battle AS ub
      ON b.battle_id = ub.battle_id
    WHERE ub.user_id = ?`
  connection.query(sqlGetBattleInformation, req.user.userId, (err, userBattleInformation) => {
    if (err) throw err
    res.status(200).send(userBattleInformation)
  })
})

module.exports = router
