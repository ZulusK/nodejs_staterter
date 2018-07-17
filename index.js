// apply module name aliases
require('module-alias/register');
// config should be imported before importing any other file
const config = require('@config');
const app = require('@config/express');
const log = require('@config/winston')(module);

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // listen on port config.port
  app.listen(config.port, () => {
    log.info(`server started on port ${config.port} (${config.env})`);
  });
}

module.exports = app;
