const express = require('express')
const pool = require('../helper/db')
const { checkStatusKey } = require('../../config')

const router = express.Router()

const checkKey = (req, res, next) => {
  const { key } = req.query
  if (key !== checkStatusKey) {
    return res.sendStatus(401)
  }
  next()
}

router.get('/', checkKey, (req, res) => pool.query('SELECT COUNT(*) as count FROM battle', (err, rows) => {
  const uptime = Number(process.uptime().toFixed(1))
  if (err) {
    return res.status(500).json({ uptime, error: err.message })
  }
  const { count } = rows[0]
  res.send({ uptime, battles: count })
}))

module.exports = router
