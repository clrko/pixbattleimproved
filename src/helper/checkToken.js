const jwt = require('jsonwebtoken')

const { jwtSecret } = require('../../config')

const checkToken = (req, res, next) => {
  const token = req.body.headers['x-access-token']
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) return res.sendStatus(401)
    req.user = decoded
    next()
  })
}

module.exports = checkToken
