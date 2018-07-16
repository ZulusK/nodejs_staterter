const validator = require('validator');
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const mongoose = require('mongoose');
const creditCardValidator = require('card-validator');

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

const CreditCardExtention = joi => ({
  base: joi.string(),
  name: 'string',
  language: {
    notACreditCard: 'This string is not a valid credit card number',
    notACVV: 'This string is not a valid CVV for a credit card',
    notAnExpirationDate: 'This string is not a valid expiration date of a credit card'
  },
  rules: [
    {
      name: 'isCreditCardNumber',
      validate(params, value, state, options) {
        const numberValidation = creditCardValidator.number(value);
        if (!numberValidation.isValid) {
          return this.createError('string.notACreditCard', { value }, state, options);
        }
        return value;
      }
    },
    {
      name: 'isCreditCardCVV',
      validate(params, value, state, options) {
        if (!creditCardValidator.cvv(value).isValid) {
          return this.createError('string.notACVV', { value }, state, options);
        }
        return value;
      }
    },
    {
      name: 'isCreditCardExpirationDate',
      validate(params, value, state, options) {
        const parsedExpDate = creditCardValidator.expirationDate(value);
        if (!parsedExpDate.isValid) {
          return this.createError('string.notAnExpirationDate', { value }, state, options);
        }
        return {
          month: parsedExpDate.month,
          year: parsedExpDate.year
        };
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
        if (!phoneUtil.isValidNumber(phone) && phoneUtil.isPossibleNumber(phone)) {
          return this.createError('string.notAPhoneNumber', { phone }, state, options);
        }
        return phoneUtil.format(phone, PNF.E164);
      }
    },
    {
      name: 'isLocalMobileNumber',
      validate(params, value, state, options) {
        const phone = phoneUtil.parseAndKeepRawInput(value, 'UA'); // TODO: replace UA -> SG
        if (!phoneUtil.isValidNumber(phone) && phoneUtil.isPossibleNumber(phone)) {
          return this.createError('string.notAPhoneNumber', { phone }, state, options);
        }
        // if (phoneUtil.getRegionCodeForNumber(phone) !== 'UA') {
        //   // TODO: replace UA -> SG
        //   return this.createError('string.notALocalPhoneNumber', { phone }, state, options);
        // }
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
  CreditCardExtention,
  PhoneExtention,
  ObjectIdExtention
};
