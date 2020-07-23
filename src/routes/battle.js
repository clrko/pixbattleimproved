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

router.get('/battle-post/:battleId/members', checkToken, (req, res) => {
  const battleId = [
    req.params.battleId
  ]
  const sqlBattleMembers =
    `SELECT u.username, u.user_id, a.avatar_url 
    FROM avatar AS a 
    JOIN user AS u 
      ON u.avatar_id = a.avatar_id 
    JOIN user_battle AS ub 
      ON ub.user_id = u.user_id 
    WHERE ub.battle_id = ?`
  connection.query(sqlBattleMembers, battleId, (err, battleMembers) => {
    if (err) throw err
    const sqlMemberStatus =
      `SELECT u.user_id 
        FROM user AS u 
        JOIN photo AS p 
          ON p.user_id = u.user_id 
        WHERE p.battle_id = ?`
    connection.query(sqlMemberStatus, battleId, (err, battleMemberStatus) => {
      if (err) throw err
      const infosParticipants = {
        battleMembers,
        battleMemberStatus
      }
      res.status(200).send(infosParticipants)
    })
  })
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
      const infos = {
        groupName,
        battleInfos
      }
      res.status(200).send(infos)
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
router.get('/battle-vote/:battleId/members', checkToken, (req, res) => {
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
    req.params.battleId
  ]
  connection.query(sqlSelectParticipants, valueBattleId, (err, allParticipants) => {
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
        allHasVoted
      }
      res.status(200).send(allInfos)
    })
  })
})

// envoie le status du current user
router.get('/battle-vote/:battleId/status-user', checkToken, (req, res) => {
  const sql =
    `SELECT p.photo_id, p.photo_url, up.vote
    FROM user_photo AS up
    JOIN photo AS p
      ON p.photo_id = up.photo_id
    WHERE up.user_id = ?
    AND p.battle_id = ?`
  const values = [
    req.user.userId,
    req.params.battleId
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
router.get('/:battleId/results', (req, res) => {
  const battleId = [req.params.battleId]
  const sqlParticipantsList =
    `SELECT DISTINCT u.username, u.user_id, a.avatar_url, p.score
    FROM avatar AS a
    JOIN user AS u
      ON u.avatar_id = a.avatar_id
    JOIN user_battle AS ub
      ON ub.user_id = u.user_id
    JOIN photo AS p
      ON p.user_id = u.user_id
    JOIN user_group AS ug
      ON ug.user_id = u.user_id
      WHERE p.battle_id = ?
      ORDER BY p.score DESC`
  connection.query(sqlParticipantsList, battleId, (err, participantsList) => {
    if (err) throw err
    const sqlVictoriesParticipants =
      `SELECT b.winner_user_id, COUNT(b.winner_user_id) AS victories
      FROM user AS u
      JOIN battle AS b
        ON b.winner_user_id = u.user_id
      JOIN user_battle AS ub
        ON ub.user_id = u.user_id
      JOIN battle AS ba
        ON ba.battle_id = ub.battle_id
      WHERE ba.battle_id = ?
      GROUP BY b.winner_user_id`
    connection.query(sqlVictoriesParticipants, battleId, (err, victoriesParticipants) => {
      if (err) throw err
      const infosResultsParticipants = {
        participantsList,
        victoriesParticipants
      }
      res.status(200).send(infosResultsParticipants)
    })
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
  const sqlGetBattleInformationValues = [
    req.user.userId
  ]
  connection.query(sqlGetBattleInformation, sqlGetBattleInformationValues, (err, userBattleInformation) => {
    if (err) throw err
    res.status(200).send(userBattleInformation)
  })
})

router.get('/my-battles/:groupId', checkToken, (req, res) => {
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
    WHERE ub.user_id = ? AND b.group_id = ?`
  const sqlGetBattleInformationValues = [
    req.user.userId,
    req.params.groupId
  ]

  connection.query(sqlGetBattleInformation, sqlGetBattleInformationValues, (err, userBattleInformation) => {
    if (err) throw err
    res.status(200).send(userBattleInformation)
  })
})

module.exports = router
