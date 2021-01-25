const EventEmitter = require('events');
const sendMail = require('./sendMail');

const myEmitter = new EventEmitter();
myEmitter.on('sendMail', (options) => {
  sendMail(options);
});

module.exports = myEmitter;
/* voir pour mettre en cci */
