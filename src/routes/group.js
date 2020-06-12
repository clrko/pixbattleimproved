const express = require('express')

const Router = express.Router()

Router.get('/', (req, res) => {
  res.send('I am on GET /pixBattle/group')
})

Router.post('/', (req, res) => {

})

module.exports = Router
