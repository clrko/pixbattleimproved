const express = require('express')

const { port } = require('./config')
const routes = require('./src/routes/index')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/auth', routes.Auth)

app.listen(port, () => {
  console.log(`server is listening on port ${port}`)
})
