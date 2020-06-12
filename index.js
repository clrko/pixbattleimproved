const cors = require('cors')
const express = require('express')
const morgan = require('morgan')

const { port } = require('./config')
const routes = require('./src/routes/index')

const app = express()

app.use(morgan('dev'))
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/auth', routes.Auth)
app.use('/register', routes.Register)

app.listen(port, () => {
  console.log(`server is listening on port ${port}`)
})
