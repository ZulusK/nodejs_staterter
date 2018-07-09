const winston = require('winston');
const config = require('./config');

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      colorize: true,
      level: config.logLvl,
      silent: config.env === 'test'
    })
  ]
});

// module.exports=logger;
module.exports = logger;
