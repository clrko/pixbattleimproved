const mysql = require('mysql2')
const { dbHost, dbUser, dbPassword, dbDatabase } = require('../../config')
const Promise = require('bluebird')

const connection = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbDatabase
})

Promise.promisifyAll(connection)

module.exports = connection
