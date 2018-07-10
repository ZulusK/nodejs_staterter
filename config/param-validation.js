const Joi = require('joi');
const validator = require('validator');

const customJoi = Joi.extend(joi => ({
  base: joi.string(),
  name: 'string',
  language: {
    isEmail: 'email {{email}} is invalid'
  },
  rules: [
    {
      name: 'isEmail',
      validate(params, value, state, options) {
        if (validator.isEmail(value)) {
          return value;
        }
        return this.createError('string.isEmail', { email: value }, state, options);
      }
    }
  ]
}));

module.exports = {
  // POST /api/auth/login
  login: {
    body: {
      email: customJoi
        .string()
        .email()
        .required(),
      password: customJoi.string().required()
    }
  },
  // POST /api/users
  createUser: {
    body: {
      email: customJoi
        .string()
        .isEmail()
        .required(),
      fullname: customJoi
        .string()
        .required()
        .regex(/^[a-zA-Z '.-]*$/),
      mobileNumber: customJoi
        .string()
        .required()
        .max(30),
      password: customJoi
        .string()
        .required()
        .min(8)
        .max(20)
        .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,20}$/)
    }
  },
  // UPDATE /api/users/:userId
  updateUser: {
    body: {
      username: customJoi.string(),
      mobileNumber: customJoi.string(),
      imageUrl: customJoi.string(),
      address: customJoi.object().keys({
        name: customJoi.string(),
        coords: {
          latitude: customJoi.string(),
          longitude: customJoi.string()
        }
      })
    },
    params: {
      userId: customJoi
        .string()
        .hex()
        .required()
    }
  }
};
