const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const router = require('express').Router();
const fs = require('fs');
const YAML = require('json2yaml');

const swaggerDefinition = {
  // API informations (required)
  info: {
    title: 'RushOwl', // Title (required)
    version: '1.0.0', // Version (required)
    description: 'API for RushOwl Backend Business logic' // Description (optional)
  }
};

const swaggerSpec = swaggerJSDoc({
  swaggerDefinition,
  // Path to the API docs
  apis: ['server/*/*.js', './docs/swagger.definitions.yml']
});

if (module.parent) {
  router.use(
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true
    })
  );
  module.exports = router;
} else {
  const outFileName = process.argv.length > 2 ? process.argv[2] : 'api.spec.yaml';
  fs.writeFileSync(outFileName, YAML.stringify(swaggerSpec));
}
