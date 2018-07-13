const validator = require('validator');
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const mongoose = require('mongoose');

const EmailExtention = joi => ({
  base: joi.string(),
  name: 'string',
  language: {
    notAnEmail: 'email {{email}} is invalid'
  },
  rules: [
    {
      name: 'isEmail',
      validate(params, value, state, options) {
        if (validator.isEmail(value)) {
          return value;
        }
        return this.createError('string.notAnEmail', { email: value }, state, options);
      }
    }
  ]
});

const PhoneExtention = joi => ({
  base: joi.string(),
  name: 'string',
  language: {
    notAPhoneNumber: 'The string {{phone}} is not a valid phone number',
    notALocalPhoneNumber: 'The number {{phone}} is noa a valid phone number of this region'
  },
  rules: [
    {
      name: 'isMobileNumber',
      validate(params, value, state, options) {
        const phone = phoneUtil.parseAndKeepRawInput(value, 'UA'); // TODO: replace UA -> SG
        if (!phoneUtil.isPossibleNumber(phone)) {
          return this.createError('string.notAPhoneNumber', { phone }, state, options);
        }
        return phoneUtil.format(phone, PNF.E164);
      }
    },
    {
      name: 'isLocalMobileNumber',
      validate(params, value, state, options) {
        const phone = phoneUtil.parseAndKeepRawInput(value, 'UA'); // TODO: replace UA -> SG
        if (!phoneUtil.isPossibleNumber(phone)) {
          return this.createError('string.notAPhoneNumber', { phone }, state, options);
        }
        if (phoneUtil.getRegionCodeForNumber(phone) !== 'UA') {
          // TODO: replace UA -> SG
          return this.createError('string.notALocalPhoneNumber', { phone }, state, options);
        }
        // Format number in the national format.
        // return phoneUtil.format(phone, PNF.NATIONAL);
        // Format number in the international format.
        // return phoneUtil.format(phone, PNF.INTERNATIONAL);
        return phoneUtil.format(phone, PNF.E164);
      }
    }
  ]
});

const ObjectIdExtention = joi => ({
  base: joi.string(),
  name: 'string',
  language: {
    thisIsNotObjectId: 'The string {{value}} is not a valid object id'
  },
  rules: [
    {
      name: 'isObjectId',
      validate(params, value, state, options) {
        if (mongoose.Types.ObjectId.isValid(value)) {
          return value;
        }
        return this.createError('string.thisIsNotObjectId', { value }, state, options);
      }
    }
  ]
});

module.exports = {
  EmailExtention,
  PhoneExtention,
  ObjectIdExtention
};
