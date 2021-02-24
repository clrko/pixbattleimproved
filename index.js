const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const logger = require('./src/helpers/logger');
const errorHandler = require('./src/helpers/errorHandler');
require('./src/helpers/updateBattleStatusJobs');

const { port, reactBuild } = require('./config');
const routes = require('./src/routes/index');

const app = express();

app.use(morgan('dev'));
app.use(
  cors({
    origin: process.env.CLIENT_PUBLIC_URL || 'http://localhost:3000',
  }),
);
app.use(express.json());
app.use(express.static('assets'));
app.use(express.static(process.env.PICS_UPLOADS_PATH || 'uploads'));
app.use(express.urlencoded({ extended: true }));

app.use('/battle', routes.Battle);
app.use('/group', routes.Group);
app.use('/status', routes.Status);
app.use('/user', routes.User);

if (reactBuild) {
  const reactBuildPath = reactBuild.startsWith('/') ? reactBuild : path.resolve(__dirname, reactBuild);
  app.use(express.static(reactBuildPath));
  app.get('/*', (req, res) => {
    res.sendFile(path.join(reactBuildPath, 'index.html'));
  });
}

// Global error handler
app.use(errorHandler);

app.listen(port, (err) => {
  if (err) {
    logger.error(`[STARTUP] Failed to start listening: ${err.message}`);
  } else {
    logger.info(`[STARTUP] Server is listening on port ${port}`);
  }
});
