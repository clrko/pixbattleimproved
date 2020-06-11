const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const morgan = require('morgan')

const pixBattle = require('./src/routes/register.js')

const app = express()
const { port } = require('./config')

app.use(morgan('dev'))
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/pixBattle', pixBattle)

app.get('/', (req, res) => {
  res.send('I am here /')
})

app.listen(port, () => {
  console.log('server is listening on port 8080')
})
