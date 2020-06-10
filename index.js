const express = require('express')

const app = express()
const { port } = require('./config')
const routes = require('./src/routes/index')

app.use('/auth', routes.Auth)

app.listen(port, () => {
  console.log(`server is listening on port ${port}`)
})
