const mongoose = require('mongoose');
const util = require('util');
// config should be imported before importing any other file
const config = require('./config/config');
const app = require('@config/express');
const log = require('@config/winston');
const debug = require('debug')('express-mongoose-es6-rest-api:index');
// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// plugin bluebird promise in mongoose
mongoose.Promise = Promise;

// connect to mongo db
const mongoUri = config.mongo.host;
mongoose.connect(
  mongoUri,
  {
    useNewUrlParser: true,
    keepAlive: 1
  }
);
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${mongoUri}`);
});
mongoose.connection.on('connected', () => {
  log.info('successfully connected to database');
  // TODO: remove this
  if (config.env !== 'production') {
    mongoose
      .model('User')
      .remove({})
      .exec()
      .then(() => {});
  }
});

// print mongoose logs in dev env
if (config.mongooseDebug) {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // listen on port config.port
  app.listen(config.port, () => {
    log.info(`server started on port ${config.port} (${config.env})`); // eslint-disable-line no-console
  });
}

module.exports = app;
