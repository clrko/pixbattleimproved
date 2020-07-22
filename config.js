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
  encryptAlgo: process.env.ENCRYPT_ALGO,
  encryptPassword: process.env.ENCRYPT_PASSWORD,
  encryptIv: process.env.ENCRYPT_IV
}
