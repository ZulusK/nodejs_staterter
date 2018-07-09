const Joi = require('joi');

module.exports = {
  // POST /api/auth/login
  login: {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().required()
    }
  },
  // POST /api/users
  createUser: {
    body: {
      email: Joi.string().required().email(),
      username: Joi.string().required().max(30),
      mobileNumber: Joi.string().required().max(30),
      password: Joi.string().required().min(6)
    }
  }
};
