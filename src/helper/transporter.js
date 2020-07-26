const nodemailer = require('nodemailer')
const { mailHost, mailPort, mailUser, mailPass } = require('../../config')
const hbs = require('./nodemailer-express-handlebars')

const transporter = nodemailer.createTransport({
  host: mailHost,
  port: mailPort,
  secure: true, // true for 465, false for other ports
  auth: {
    user: mailUser,
    pass: mailPass
  }
})

transporter.use('compile', hbs({
  viewEngine: 'express-handlebars',
  viewPath: './views'
}))

module.exports = transporter
