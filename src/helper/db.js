const mysql = require('mysql2')
const Promise = require('bluebird')
const { dbHost, dbUser, dbPassword, dbDatabase } = require('../../config')
const logger = require('./logger')

const pool = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbDatabase
})

process.on('exit', () => {
  logger.info('[SHUTDOWN] About to exit, closing pool')
  pool.end(function (err) {
    if (err) logger.error('[SHUTDOWN] Failed to close pool', err)
    else logger.info('[SHUTDOWN] Pool closed')
  })
})

Promise.promisifyAll(pool)

module.exports = pool
