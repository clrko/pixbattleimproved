const express = require('express')
const router = express.Router()
const checkToken = require('../helper/checkToken')
const connection = require('../helper/db')
const eventEmitterMail = require('../helper/eventEmitterMail')
const multer = require('multer')
const { scheduleStatusUpdatePostToVote, scheduleStatusUpdateVoteToCompleted } = require('../helper/updateBattleStatusJobs')

// Battle Creation
router.get('/battle-creation/themes', (req, res, next) => {
  const sql = 'SELECT * FROM theme ORDER BY RAND() LIMIT 10;'
  connection.query(sql, (err, themeList) => {
    if (err) return next(err)
    return res.status(201).send(themeList)
  })
})

router.get('/battle-creation/rules', (req, res, next) => {
  const sql = 'SELECT * FROM rule;'
  connection.query(sql, (err, ruleList) => {
    if (err) return next(err)
    return res.status(201).send(ruleList)
  })
})

router.post('/battle-creation', checkToken, (req, res, next) => {
  const { userId, username } = req.user
  const { deadline, groupId, themeId, rulesId } = req.body
  const sql = 'INSERT INTO battle (deadline, group_id, theme_id, admin_user_id, status_id) VALUES (?, ?, ?, ?, 1)'
  const value = [
    deadline,
    groupId,
    themeId,
    userId
  ]
  connection.query(sql, value, (err, battleCreationResult) => {
    if (err) return next(err)
    const createdBattleId = battleCreationResult.insertId
    const battleIdDeadline = { battle_id: createdBattleId, deadline: new Date(req.body.deadline) }
    scheduleStatusUpdatePostToVote(battleIdDeadline)
    scheduleStatusUpdateVoteToCompleted(battleIdDeadline)
    const sqlBattleRule = 'INSERT INTO battle_rule VALUES ?'
    const insertBattleRulesValues = rulesId.map(rule => [createdBattleId, rule])
    connection.query(sqlBattleRule, [insertBattleRulesValues], err => {
      if (err) return next(err)
      const sqlGetGroupUsers = 'SELECT ug.user_id, u.username, u.email, g.group_name FROM user_group AS ug JOIN user AS u ON ug.user_id = u.user_id JOIN `group` As g ON g.group_id = ? WHERE ug.group_id = ?'
      connection.query(sqlGetGroupUsers, [groupId, groupId], (err, users) => {
        if (err) return next(err)
        const sqlUserBattle = 'INSERT INTO user_battle VALUES ?'
        const userBattleValues = users.map(user => [user.user_id, createdBattleId])
        const groupName = users[0].group_name
        connection.query(sqlUserBattle, [userBattleValues], err => {
          if (err) return next(err)
          users.forEach(user => eventEmitterMail.emit('sendMail', { type: 'battleNew', to: user.email, subject: `${username} a créé une nouvelle battle`, userName: user.username, groupId, groupName, battleId: createdBattleId }))
          return res.status(201).send({ battleId: createdBattleId })
        })
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

router.get('/battle-post/:battleId/members', checkToken, (req, res, next) => {
  const battleId = [
    req.params.battleId
  ]
  const sqlBattlePostStatus =
    `SELECT u.user_id, u.username, a.avatar_url, SUM(CASE WHEN p.battle_id = ? THEN 1 ELSE 0 END) AS posted
  FROM avatar AS a
  INNER JOIN user AS u
    ON u.avatar_id = a.avatar_id
  INNER JOIN user_battle AS ub
    ON ub.user_id = u.user_id
  LEFT JOIN photo AS p
    ON u.user_id = p.user_id
  WHERE ub.battle_id = ?
  GROUP BY u.user_id;`
  connection.query(sqlBattlePostStatus, [battleId, battleId], (err, battleMemberStatus) => {
    if (err) return next(err)
    res.status(200).send(battleMemberStatus)
  })
})

router.get('/battle-post/status-user', checkToken, (req, res, next) => {
  const sql =
    `SELECT *
    FROM photo AS p
    WHERE p.user_id = ?
    AND p.battle_id IN(?)`
  const values = [
    req.user.userId,
    req.query.id
  ]
  connection.query(sql, values, (err, result) => {
    if (err) return next(err)
    res.status(200).send(result)
  })
})

router.get('/battle-post/:groupId/:battleId', checkToken, (req, res, next) => {
  const sqlHasPosted = 'SELECT photo_url FROM photo WHERE battle_id = ? AND user_id = ?'
  const valueBattleId = [
    req.params.battleId,
    req.user.userId
  ]
  connection.query(sqlHasPosted, valueBattleId, (err, photos) => {
    if (err) return next(err)
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
      if (err) return next(err)
      const photo = photos[0]
      const infos = {
        photoUrl: photo && photo.photo_url,
        battleInfos
      }
      res.status(200).send(infos)
    })
  })
})

router.post(
  '/battle-post/addpicture',
  checkToken,
  upload.single('file'),
  (req, res, next) => {
    const sqlExistingPhoto = 'SELECT * FROM photo WHERE user_id = ? AND battle_id = ?'
    const valuesExistingPhoto = [
      req.user.userId,
      req.body.battleId
    ]
    connection.query(sqlExistingPhoto, valuesExistingPhoto, (err, photos) => {
      if (err) return next(err)
      if (photos.length > 0) {
        return res.sendStatus(409)
      }
      const sqlInsertPhoto = 'INSERT INTO photo (photo_url, user_id, battle_id, group_id) VALUES (?, ?, ?, ?)'
      const valuesInsertPhoto = [
        req.file.filename,
        req.user.userId,
        req.body.battleId,
        req.body.groupId
      ]
      connection.query(sqlInsertPhoto, valuesInsertPhoto, (err, photoRes) => {
        if (err) return next(err)
        const photoId = {
          photoId: photoRes.insertId
        }
        res.status(201).send(photoId)
      })
    })
  }
)

router.put('/battle-post/:photoId', checkToken, (req, res, next) => {
  const sqlUpdatePhoto = 'UPDATE photo SET photo_url = ? WHERE photo_id = ?'
  const valuesUpdatePhoto = [
    req.body.photoUrl,
    req.params.photoId
  ]
  connection.query(sqlUpdatePhoto, valuesUpdatePhoto, err => {
    if (err) return next(err)
    res.sendStatus(200)
  })
})

router.delete('/battle-post', checkToken, (req, res, next) => {
  const sqlDeletePhoto = 'DELETE FROM photo WHERE photo_id = ?'
  const valueDeletePhoto = [
    req.body.photoId
  ]
  connection.query(sqlDeletePhoto, valueDeletePhoto, err => {
    if (err) return next(err)
    res.sendStatus(200)
  })
})

// Battle Vote
router.get('/battle-vote/:battleId', checkToken, (req, res, next) => {
  const sqlPhotosBattle =
    `SELECT * FROM photo AS p
    JOIN battle AS b
      ON b.battle_id = p.battle_id
    WHERE b.battle_id = ?
      AND NOT p.user_id = ?`
  const battleId = [
    req.params.battleId,
    req.user.userId
  ]
  connection.query(sqlPhotosBattle, battleId, (err, photosBattleUrls) => {
    if (err) return next(err)
    res.status(200).send(photosBattleUrls)
  })
})

router.get('/battle-vote/:battleId/members', checkToken, (req, res, next) => {
  const valueBattleId = [
    req.params.battleId
  ]
  const sqlBattleVoteStatus =
    `SELECT DISTINCT u.user_id, u.username, a.avatar_url, SUM(CASE WHEN up.photo_id IN (SELECT p.photo_id FROM photo AS p WHERE p.battle_id = ?) THEN 1 ELSE 0 END) AS voted
    FROM user AS u
    INNER JOIN avatar AS a
      ON u.avatar_id = a.avatar_id
    INNER JOIN user_battle AS ub
      ON ub.user_id = u.user_id
    LEFT JOIN user_photo AS up
      ON u.user_id = up.user_id
    WHERE ub.battle_id = ?
    GROUP BY u.user_id`
  connection.query(sqlBattleVoteStatus, [valueBattleId, valueBattleId], (err, allInfos) => {
    if (err) return next(err)
    res.status(200).send(allInfos)
  })
})

// envoie le status du current user
router.get('/battle-vote/:battleId/status-user', checkToken, (req, res, next) => {
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
    if (err) return next(err)
    res.status(200).send(result)
  })
})

router.post('/battle-vote', checkToken, (req, res, next) => {
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
    if (err) return next(err)
    res.sendStatus(201)
  })
})

// Battle Results
router.get('/:battleId/results', (req, res, next) => {
  const battleId = [req.params.battleId]
  const sqlParticipantsList =
    `SELECT u.user_id, u.username, a.avatar_url, p.score
    FROM user AS u
    INNER JOIN avatar AS a
      ON u.avatar_id = a.avatar_id
    INNER JOIN user_battle AS ub
      ON ub.user_id = u.user_id
    LEFT JOIN photo AS p
      ON ub.user_id = p.user_id
    WHERE p.battle_id = ?
    GROUP BY u.user_id, p.score
    ORDER BY p.score DESC`
  connection.query(sqlParticipantsList, battleId, (err, participantsList) => {
    if (err) return next(err)
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
      if (err) return next(err)
      const infosResultsParticipants = {
        participantsList,
        victoriesParticipants
      }
      res.status(200).send(infosResultsParticipants)
    })
  })
})

// Battle Results Photos
router.get('/battle-results/:battleId/photos', checkToken, (req, res, next) => {
  const battleId = [req.params.battleId]
  const sqlGetPhotos =
    `SELECT u.username, a.avatar_url, p.*
    FROM avatar AS a
    JOIN user AS u
      ON u.avatar_id = a.avatar_id
    JOIN photo AS p
      ON p.user_id = u.user_id
    WHERE battle_id = ?`
  connection.query(sqlGetPhotos, battleId, (err, photos) => {
    if (err) return next(err)
    const sqlGetUsers =
      `SELECT u.username, a.avatar_url, up.vote, up.photo_id
      FROM avatar AS a
      JOIN user AS u
        ON u.avatar_id = a.avatar_id
      JOIN user_photo AS up
        ON up.user_id = u.user_id
      JOIN photo AS p
        ON p.photo_id = up.photo_id
      WHERE p.battle_id = ?`
    connection.query(sqlGetUsers, battleId, (err, users) => {
      if (err) return next(err)
      const resultsPhotos = {
        photos,
        users
      }
      res.status(200).send(resultsPhotos)
    })
  })
})

// Battle General information
router.get('/my-battles', checkToken, (req, res, next) => {
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
    if (err) return next(err)
    res.status(200).send(userBattleInformation)
  })
})

router.get('/my-battles/:groupId', checkToken, (req, res, next) => {
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
    if (err) return next(err)
    res.status(200).send(userBattleInformation)
  })
})

router.get('/my-battles/:groupId/pending', (req, res, next) => {
  const sqlGetPendingBattleGroup =
    `SELECT battle_id, status_id
    FROM battle
    WHERE group_id = ?
    AND status_id != 3
    `
  const { groupId } = req.params
  connection.query(sqlGetPendingBattleGroup, groupId, (err, battles) => {
    if (err) return next(err)
    res.json({ pending: battles.length > 0 })
  })
})

module.exports = router
