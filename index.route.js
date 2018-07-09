const express = require('express');
const authRoutes = require('@server/auth/auth.route');
const cp = require('child_process');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const usersRoutes = require('@server/user/user.route');

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
module.exports = router;
