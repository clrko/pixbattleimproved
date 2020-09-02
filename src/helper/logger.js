const { createLogger, format, transports } = require('winston')
const EmailTransport = require('./loggerEmailTransport')
const { combine, timestamp, printf } = format
const { criticalErrorEmails } = require('../../config')

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`
})

const logger = createLogger({
  transports: [
    new transports.File({
      filename: 'combined.log',
      format: combine(
        timestamp(),
        myFormat
      )
    }),
    new transports.Console({
      level: 'info',
      format: combine(
        timestamp(),
        format.colorize(),
        myFormat
      )
    }),
    new EmailTransport({ emails: criticalErrorEmails })
  ]
})

logger.exceptions.handle(
  new EmailTransport({ emails: criticalErrorEmails })
)

module.exports = logger
