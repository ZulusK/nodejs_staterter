const express = require('express');
const authRoutes = require('@server/auth/auth.route');
const cp = require('child_process');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const usersRoutes = require('@server/user/user.route');
const stopsRoute = require('@server/stop/stop.route');
const routesRoute = require('@server/route/route.route');
const busesRoute = require('@server/bus/bus.route');

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) => {
  const revision = cp
    .execSync('git rev-parse HEAD')
    .toString()
    .trim();

  res.send(`OK: ${revision}`);
});

const swaggerDefinition = {
  // API informations (required)
  info: {
    title: 'Rushowl Business Logic Back End', // Title (required)
    version: '1.0.0', // Version (required)
    description: 'API for Rushowl React Native app' // Description (optional)
  }
};

const swaggerSpec = swaggerJSDoc({
  swaggerDefinition,
  // Path to the API docs
  apis: ['server/*/*.js', './swagger.definitions.yml']
});

// TODO: disable on production, because it uses a lot of mem
router.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true
  })
);

module.exports = router;
router.use('/users', usersRoutes);
router.use('/auth', authRoutes);
router.use('/stops', stopsRoute);
router.use('/routes', routesRoute);
router.use('/buses', busesRoute);

module.exports = router;
