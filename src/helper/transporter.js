const nodemailer = require('nodemailer');
const path = require('path');
const { mailHost, mailPort, mailUser, mailPass } = require('../../config');
const hbs = require('nodemailer-express-handlebars');

const transporter = nodemailer.createTransport({
  host: mailHost,
  port: mailPort,
  pool: true,
  secure: true, // true for 465, false for other ports
  auth: {
    user: mailUser,
    pass: mailPass,
  },
});

transporter.use(
  'compile',
  hbs({
    viewEngine: { layoutsDir: '../views', engine: 'express-handlebars', defaultLayout: false },
    viewPath: path.resolve(__dirname, '../views'),
  }),
);

module.exports = transporter;
