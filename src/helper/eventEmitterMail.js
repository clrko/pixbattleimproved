const EventEmitter = require('events')
const sendMail = require('./sendMail')

const myEmitter = new EventEmitter()
myEmitter.on('sendMail', options => {
  console.log('an event occurred!', options)
  sendMail(options)
})

module.exports = myEmitter
/* voir pour emttre en cci */
