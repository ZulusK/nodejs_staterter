const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const router = require('express').Router();
const fs = require('fs');

const swaggerDefinition = {
  // API informations (required)
  info: {
    title: 'Comics-space', // Title (required)
    version: '1.0.0', // Version (required)
    description: 'API for Comics-space app' // Description (optional)
  }
};

const swaggerSpec = swaggerJSDoc({
  swaggerDefinition,
  // Path to the API docs
  apis: ['server/*/*.js', './swagger.definitions.yml']
});

if (module.parent) {
  router.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true
    })
  );
  module.exports = router;
} else {
  const outFileName = process.argv.length > 2 ? process.argv[2] : 'api.spec.json';
  fs.writeFileSync(outFileName, JSON.stringify(swaggerSpec));
}
// // TODO: disable on production, because it uses a lot of memory
