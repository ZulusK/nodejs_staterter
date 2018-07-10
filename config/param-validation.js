const Joi = require('joi');

module.exports = {
  // POST /api/auth/login
  login: {
    body: {
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string().required()
    }
  },
  // POST /api/users
  createUser: {
    body: {
      email: Joi.string()
        .required()
        .email(),
      fullname: Joi.string()
        .required()
        .regex(/^[a-zA-Z '.-]*$/),
      mobileNumber: Joi.string()
        .required()
        .max(30),
      password: Joi.string()
        .required()
        .min(6)
    }
  },
  // UPDATE /api/users/:userId
  updateUser: {
    body: {
      username: Joi.string(),
      mobileNumber: Joi.string(),
      imageUrl: Joi.string(),
      address: Joi.object().keys({
        name: Joi.string(),
        coords: {
          latitude: Joi.string(),
          longitude: Joi.string()
        }
      })
    },
    params: {
      userId: Joi.string()
        .hex()
        .required()
    }
  }
};
