// apply module name aliases
require('module-alias/register');
const path = require('path');
const Joi = require('joi');
const JoiExt = require('./joi.extentions');

const customJoi = Joi.extend([JoiExt.PhoneExtention]);

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = customJoi
  .object({
    NODE_ENV: customJoi
      .string()
      .allow(['development', 'production', 'test', 'provision'])
      .default('development'),
    PORT: customJoi.number().default(4040),
    MONGOOSE_DEBUG: customJoi.boolean().when('NODE_ENV', {
      is: customJoi.string().equal('development'),
      then: customJoi.boolean().default(true),
      otherwise: customJoi.boolean().default(false)
    }),
    JWT_SECRET_ACCESS: customJoi
      .string()
      .required()
      .description('JWT access secret required in sign'),
    JWT_SECRET_REFRESH: customJoi
      .string()
      .required()
      .description('JWT refresh secret required in sign'),
    JWT_REFRESH_EXP: customJoi
      .number()
      .when('NODE_ENV', {
        is: customJoi.string().equal('test'),
        then: customJoi.number().default(1),
        otherwise: customJoi.number().default(60 * 60 * 24 * 30)
      })
      // .default(60 * 60 * 24 * 30) //  30 days
      .description('Lifetime of JWT refresh token'),
    JWT_ACCESS_EXP: customJoi
      .number()
      .when('NODE_ENV', {
        is: customJoi.string().equal('test'),
        then: customJoi.number().default(1),
        otherwise: customJoi.number().default(60 * 60)
      })
      // .default(60 * 60) // 1 hour
      .description('Lifetime of JWT access token'),
    JWT_SECRET_EMAIL_CONFIRMATION: customJoi
      .string()
      .required()
      .description('JWT access secret required in email confirmation'),
    JWT_SECRET_PHONE_CONFIRMATION: customJoi
      .string()
      .required()
      .description('JWT access secret required in phone confirmation'),
    MONGO_HOST: customJoi
      .string()
      .required()
      .description('Mongo DB host url'),
    MONGO_PORT: customJoi.number().default(27017),
    LOG_LEVEL: customJoi.string().when('NODE_ENV', {
      is: customJoi.string().equal('development'),
      then: customJoi.string().default('debug'),
      otherwise: customJoi.string().default('info')
    }),
    EMAIL_ADDRESS: customJoi
      .string()
      .required()
      .email()
      .description('Email address of paid account'),
    EMAIL_PASSWORD: customJoi
      .string()
      .required()
      .description('Password of paid account'),
    GOOGLE_MAPS_API_KEY: customJoi
      .string()
      .required()
      .description('API key from activated Google Maps account'),
    TWILIO_SID: customJoi
      .string()
      .required()
      .description('Twilio API sid'),
    TWILIO_TOKEN: customJoi
      .string()
      .required()
      .description('Twilio auth API token'),
    TWILIO_PHONE_NUMBER: customJoi
      .string()
      .isMobileNumber()
      .required()
      .description('Twilio phone number for messaging'),
    SMS_LIMIT_PER_HOUR: customJoi.number().when('NODE_ENV', {
      is: customJoi.string().equal('test'),
      then: customJoi.number().default(2),
      otherwise: customJoi.number().default(100) // production
    }),
    SMS_TIMEOUT: customJoi.number().when('NODE_ENV', {
      is: customJoi.string().equal('test'),
      then: customJoi.number().default(100),
      otherwise: customJoi.number().default(1000 * 30) // production, 30 seconds
    }),
    OTP_LENGTH: customJoi.number().default(4),
    JWT_PHONE_CONFIRMATION_EXP: customJoi
      .number()
      .when('NODE_ENV', {
        is: customJoi.string().equal('test'),
        then: customJoi.number().default(1),
        otherwise: customJoi.number().default(60)
      })
      .description('Lifetime of JWT token, used after phone verification')
  })
  .unknown()
  .required();

const { error, value: envVars } = customJoi.validate(process.env, envVarsSchema);
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
  logLvl: envVars.LOG_LEVEL,
  emailAddress: envVars.EMAIL_ADDRESS,
  emailPassword: envVars.EMAIL_PASSWORD,
  publicDir: path.join(__dirname, '..', 'public'),
  host: envVars.NODE_ENV === 'production' ? '' : 'http://localhost:3000',
  jwtSecretEmailConfirmation: envVars.JWT_SECRET_EMAIL_CONFIRMATION,
  jwtSecretPhoneConfirmation: envVars.JWT_SECRET_PHONE_CONFIRMATION,
  gmApiKey: envVars.GOOGLE_MAPS_API_KEY,
  twilioSid: envVars.TWILIO_SID,
  twilioPhone: envVars.TWILIO_PHONE_NUMBER,
  twilioToken: envVars.TWILIO_TOKEN,
  smsTimeout: envVars.SMS_TIMEOUT,
  smsLimitPerHour: envVars.SMS_LIMIT_PER_HOUR,
  otpLen: envVars.OTP_LENGTH,
  jwtExpPhoneConfrimation: envVars.JWT_PHONE_CONFIRMATION_EXP
};
module.exports = config;
