const Joi = require('joi');
const JoiExt = require('./joi.extentions');

const customJoi = Joi.extend([
  JoiExt.ObjectIdExtention,
  JoiExt.EmailExtention,
  JoiExt.PhoneExtention
]);

module.exports = {
  // POST /api/auth/login
  login: {
    body: {
      email: customJoi
        .string()
        .isEmail()
        .required(),
      password: customJoi
        .string()
        .required()
        .min(8)
        .max(20)
        .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,20}$/)
    }
  },
  // POST /api/users
  createUser: {
    body: {
      email: customJoi
        .string()
        .trim()
        .isEmail()
        .required(),
      fullname: customJoi
        .string()
        .trim()
        .required()
        .regex(/^[a-zA-Z '.-]*$/),
      mobileNumber: customJoi
        .string()
        .trim()
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
  // POST /api/stops
  createStop: {
    body: {
      name: customJoi
        .string()
        .trim()
        .min(3)
        .required(),
      address: customJoi
        .string()
        .trim()
        .min(5)
        .required(),
      latitude: customJoi.number().required(),
      longitude: customJoi.number().required()
    }
  },

  // POST /api/stops/:stopId
  updateStop: {
    body: {
      name: customJoi
        .string()
        .trim()
        .min(3)
        .required(),
      address: customJoi
        .string()
        .trim()
        .min(5)
        .required(),
      latitude: customJoi.number().required(),
      longitude: customJoi.number().required()
    }
  },
  // /api/stops/:stopId
  stopIdParam: {
    params: {
      userId: customJoi
        .string()
        .isObjectId()
        .required()
    }
  }
};
