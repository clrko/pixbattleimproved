const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
require('./src/helper/updateBattleStatusJobs')

const { port } = require('./config')
const routes = require('./src/routes/index')

const app = express()

app.use(morgan('dev'))
app.use(cors({
  origin: process.env.CLIENT_PUBLIC_URL || 'http://localhost:3000'
}))
app.use(express.json())
app.use(express.static(process.env.PICS_UPLOADS_PATH || 'uploads'))
app.use(express.urlencoded({ extended: true }))

app.use('/auth', routes.Auth)
app.use('/battle', routes.Battle)
app.use('/gallery', routes.Gallery)
app.use('/group', routes.Group)
app.use('/group-creation', routes.GroupCreation)
app.use('/members', routes.Members)
app.use('/profile', routes.Profile)
app.use('/register', routes.Register)

app.listen(port, () => {
  console.log(`server is listening on port ${port}`)
})
