const jwt = require('jsonwebtoken');

const { jwtSecret } = require('../../config');

const checkToken = (req, res, next) => {
  const authHeaders = req.headers.authorization;
  if (!authHeaders) return res.sendStatus(401);
  const token = authHeaders.split(' ')[1];
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) return res.sendStatus(401);
    req.user = decoded;
    next();
  });
};

module.exports = checkToken;
