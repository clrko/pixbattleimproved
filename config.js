const dotenv = require('dotenv')
dotenv.config()

module.exports = {
  port: process.env.PORT,
  dbHost: process.env.DB_HOST,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbDatabase: process.env.DB_DATABASE,
  jwtSecret: process.env.JWT_SECRET,
  mailHost: process.env.MAIL_HOST,
  mailPort: process.env.MAIL_PORT,
  mailUser: process.env.MAIL_USER,
  mailPass: process.env.MAIL_PASS,
  appBaseUrl: process.env.APP_BASE_URL,
  appName: process.env.APP_NAME,
  serverBaseUrl: process.env.SERVER_BASE_URL || `http://localhost:${process.env.PORT}`,
  encryptAlgo: process.env.ENCRYPT_ALGO,
  encryptPassword: process.env.ENCRYPT_PASSWORD,
  encryptIv: process.env.ENCRYPT_IV,
  reactBuild: process.env.REACT_BUILD_PATH,
  votingPhase: {
    durationUnit: process.env.VOTING_PHASE_DURATION_UNIT || 'hours',
    durationNumber: isNaN(process.env.VOTING_PHASE_DURATION_NUM)
      ? 24
      : Number(process.env.VOTING_PHASE_DURATION_NUM)
  },
  checkStatusKey: process.env.CHECK_STATUS_KEY || 'status'
}
