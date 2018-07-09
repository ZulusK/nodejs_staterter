const express = require('express');
const authRoutes = require('@server/auth/auth.route');
const cp = require('child_process');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

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
  info: {
    // API informations (required)
    title: 'Rushowl Business Logic Back End', // Title (required)
    version: '1.0.0', // Version (required)
    description: 'API for Rushowl React Native app' // Description (optional)
  }
};

const swaggerSpec = swaggerJSDoc({
  swaggerDefinition,
  // Path to the API docs
  apis: ['server/*/*.route.js']
});

router.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true
  })
);

module.exports = router;

router.use('/auth', authRoutes);
module.exports = router;
