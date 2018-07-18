const { createLogger, format, transports } = require('winston');

const customPrintf = format.printf(info => `[${info.label}] ${info.level}: ${info.message}`);

const config = require('./config');

function getLogger(module) {
  const path = module.filename
    .split('/')
    .slice(-2)
    .join('/');
  return createLogger({
    format: format.combine(
      format.splat(),
      format.label({ label: path }),
      format.colorize(),
      customPrintf
    ),
    transports: [
      new transports.Console({
        colorize: true,
        level: config.LOG_LEVEL,
        silent: config.env === 'test'
      })
    ]
  });
}

module.exports = getLogger;
