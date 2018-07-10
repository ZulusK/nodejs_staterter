const Joi = require('joi');
const JoiExt = require('./joi.extentions');

const customJoi = Joi.extend([JoiExt.EmailExtention, JoiExt.PhoneExtention]);

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
        .isMobileNumber()
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
