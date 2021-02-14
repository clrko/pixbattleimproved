const { checkStatusKey } = require('../../config');

const checkKey = (req, res, next) => {
  const { key } = req.query;
  if (key !== checkStatusKey) {
    return res.sendStatus(401);
  }
  next();
};

module.exports = checkKey;
