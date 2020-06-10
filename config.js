const dotenv = require('dotenv')
dotenv.config()

module.exports = {
  port: process.env.PORT,
  db_host: process.env.DB_HOST,
  db_user: process.env.DB_USER,
  db_password: process.env.DB_PASSWORD,
  db_database: process.env.DB_DATABASE
}
