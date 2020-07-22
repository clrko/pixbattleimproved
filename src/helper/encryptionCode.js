const crypto = require('crypto')
const { encryptAlgo, encryptPassword, encryptIv } = require('../../config')

const encrypt = text => {
  const cipher = crypto.createCipheriv(encryptAlgo, encryptPassword, encryptIv)
  let crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

const decrypt = text => {
  const decipher = crypto.createDecipheriv(encryptAlgo, encryptPassword, encryptIv)
  let dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8')
  return dec
}

module.exports = {
  encrypt,
  decrypt
}
