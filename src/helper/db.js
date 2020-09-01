const mysql = require('mysql2')
const { dbHost, dbUser, dbPassword, dbDatabase } = require('../../config')
const Promise = require('bluebird')

const pool = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbDatabase
})

process.on('exit', () => {
  console.log('About to exit, closing pool')
  pool.end(function (err) {
    if (err) console.error('Failed to close pool', err)
    else console.log('Pool closed')
  })
})

Promise.promisifyAll(pool)

module.exports = pool
