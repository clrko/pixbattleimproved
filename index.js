const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const path = require('path')
const logger = require('./src/helper/logger')
require('./src/helper/updateBattleStatusJobs')

const { port, reactBuild } = require('./config')
const routes = require('./src/routes/index')

const app = express()

app.use(morgan('dev'))
app.use(cors({
  origin: process.env.CLIENT_PUBLIC_URL || 'http://localhost:3000'
}))
app.use(express.json())
app.use(express.static('assets'))
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
app.use('/status', routes.Status)

if (reactBuild) {
  const reactBuildPath = reactBuild.startsWith('/')
    ? reactBuild
    : path.resolve(__dirname, reactBuild)
  app.use(express.static(reactBuildPath))
  app.get('/*', (req, res) => {
    res.sendFile(path.join(reactBuildPath, 'index.html'))
  })
}

app.listen(port, (err) => {
  if (err) {
    logger.error(`[STARTUP] Failed to start listening: ${err.message}`)
  } else {
    logger.info(`[STARTUP] Server is listening on port ${port}`)
  }
})
