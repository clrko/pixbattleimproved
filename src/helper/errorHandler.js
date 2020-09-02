const logger = require('./logger')

function errorHandler (err, req, res, next) {
  logger.error(err.stack)
  if (res.headersSent) {
    return next(err)
  }
  res.status(500).json({
    error: err.message
  })
}

module.exports = errorHandler
