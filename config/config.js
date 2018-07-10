// apply module name aliases
require('module-alias/register');

const Joi = require('joi');

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(['development', 'production', 'test', 'provision'])
    .default('development'),
  PORT: Joi.number().default(4040),
  MONGOOSE_DEBUG: Joi.boolean().when('NODE_ENV', {
    is: Joi.string().equal('development'),
    then: Joi.boolean().default(true),
    otherwise: Joi.boolean().default(false)
  }),
  JWT_SECRET_ACCESS: Joi.string()
    .required()
    .description('JWT access Secret required to sign'),
  JWT_SECRET_REFRESH: Joi.string()
    .required()
    .description('JWT refresh Secret required to sign'),
  JWT_REFRESH_EXP: Joi.number()
    .default(60 * 60 * 24 * 30) //  30 days
    .description('Lifetime of JWT refresh token'),
  JWT_ACCESS_EXP: Joi.number()
    .default(60 * 60) // 1 hour
    .description('Lifetime of JWT access token'),
  MONGO_HOST: Joi.string()
    .required()
    .description('Mongo DB host url'),
  MONGO_PORT: Joi.number().default(27017),
  LOG_LEVEL: Joi.string().when('NODE_ENV', {
    is: Joi.string().equal('development'),
    then: Joi.string().default('debug'),
    otherwise: Joi.string().default('info')
  })
})
  .unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongooseDebug: envVars.MONGOOSE_DEBUG,
  jwtSecretAccess: envVars.JWT_SECRET_ACCESS,
  jwtSecretRefresh: envVars.JWT_SECRET_REFRESH,
  jwtExpAccess: envVars.JWT_ACCESS_EXP,
  jwtExpRefresh: envVars.JWT_REFRESH_EXP,
  mongo: {
    host: envVars.MONGO_HOST
  },
  logLvl: envVars.LOG_LEVEL
};
module.exports = config;
