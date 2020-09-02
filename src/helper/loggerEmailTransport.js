const Transport = require('winston-transport')
const eventEmitterMail = require('./eventEmitterMail')

module.exports = class EmailTransport extends Transport {
  constructor (opts) {
    super(opts)
    this.emails = opts.emails
    //
    // Consume any custom options here. e.g.:
    // - Connection information for databases
    // - Authentication information for APIs (e.g. loggly, papertrail,
    //   logentries, etc.).
    //
  }

  log (info, callback) {
    setImmediate(() => {
      this.emit('logged', info)
    })

    // Perform the writing to the remote service
    if (info.level === 'error') {
      const { message } = info
      const shortMessage = message.length <= 40
        ? message
        : `${message.substr(0, 40)}[...]`
      eventEmitterMail.emit('sendMail', {
        type: 'criticalError',
        subject: `[PixBattle] ERREUR SERVEUR : ${shortMessage}`,
        to: this.emails,
        errorMessage: info.message
      })
    }
    callback()
  }
}
