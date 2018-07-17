// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();
const path = require('path');
const Joi = require('joi');

const currentConfig = require(`./modes/${process.env.NODE_ENV}`); // eslint-disable-line import/no-dynamic-require

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(['development', 'production', 'test'])
    .default('development'),
  PORT: Joi.number().default(3000),
  LOG_LEVEL: Joi.string().when('NODE_ENV', {
    is: Joi.string().equal('development'),
    then: Joi.string().default('debug'),
    otherwise: Joi.string().default('info')
  }),
  HOST: Joi.string().required(),
  PUBLIC_DIR: Joi.string().default(path.join('..', 'public'))
})
  .unknown()
  .required();

const { error, value: envVars } = Joi.validate(currentConfig, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  logLvl: envVars.LOG_LEVEL,
  publicDir: envVars.PUBLIC_DIR,
  host: envVars.HOST
};
module.exports = config;
