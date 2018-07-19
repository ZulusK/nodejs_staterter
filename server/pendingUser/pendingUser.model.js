const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
const config = require('@config/config');
const jwt = require('jsonwebtoken');
const SmsMessanger = require('@/mailer/sms');
const _ = require('lodash');
const utils = require('@/utils');

const PendingUserSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    index: true,
    required: true
  },
  otp: {
    trim: true,
    type: String,
    private: true
  },
  timeOfMessageSending: {
    type: [Number],
    default: []
  }
});

PendingUserSchema.methods.genOtpSMS = function genOtpSMS() {
  const body = `Here is your activation code\n${this.otp}\nYours Rush-Owl `;
  return body;
};

PendingUserSchema.methods.checkOtp = function checkOtp(otp) {
  const lastSMSTime = _.max(this.timeOfMessageSending);
  const now = Date.now();
  const pendingTime = now - lastSMSTime;

  if (otp !== this.otp) {
    throw new APIError('Your otp is invalid', httpStatus.BAD_REQUEST, true);
  }
  if (pendingTime > config.smsTimeout * 2) {
    throw new APIError(
      'Your one time password is outdated, please generate new one',
      httpStatus.BAD_REQUEST,
      true
    );
  }
  return true;
};

PendingUserSchema.methods.sendOtpViaSMS = function sendOtpViaSMS() {
  if (this.canReceiveSMS()) {
    this.otp = utils.genOtp(config.otpLen);
    this.timeOfMessageSending.push(Date.now());
    return this.save()
      .then(() => SmsMessanger.sendSMS({
        to: this.mobileNumber,
        body: this.genOtpSMS()
      }))
      .then(() => this.otp);
  }
  return null;
};
/**
 * Check, can user receive sms
 */
PendingUserSchema.methods.canReceiveSMS = function canReceiveSMS() {
  this.updateSMSTimings();
  if (this.timeOfMessageSending.length === 0) {
    return true;
  }
  const lastSMSTime = _.max(this.timeOfMessageSending);
  const now = Date.now();
  const pendingTime = now - lastSMSTime;
  if (this.timeOfMessageSending.length < config.smsLimitPerHour) {
    if (pendingTime > config.smsTimeout) {
      return true;
    }
    throw new APIError(
      `Please, wait ${Math.floor((config.smsTimeout - pendingTime) / 1000)} seconds`,
      httpStatus.BAD_REQUEST,
      true
    );
  }
  throw new APIError(
    'You sent the maximum number of SMS to this number. Please, wait',
    httpStatus.BAD_REQUEST,
    true
  );
};
/**
 * Updates times of received sms by user
 */
PendingUserSchema.methods.updateSMSTimings = function updateSMSTimings() {
  const now = Date.now();
  this.timeOfMessageSending = _.filter(
    this.timeOfMessageSending,
    d => now - d <= 1000 * 3600 // one hour
  );
};

/**
 * Generate activation token
 */
PendingUserSchema.methods.genActivationToken = function genActivationToken() {
  return jwt.sign({ id: this.id }, config.jwtSecretPhoneConfirmation, {
    expiresIn: config.jwtExpPhoneConfrimation
  });
};

/**
 * Statics
 */
PendingUserSchema.statics = {
  findOrCreate({ mobileNumber }) {
    // search for user
    return this.findOne({ mobileNumber })
      .exec()
      .then((pendingUser) => {
        if (!pendingUser) {
          return this.create({ mobileNumber });
        }
        return pendingUser;
      });
  },
  get(id) {
    return this.findById(id)
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  getByMobileNumber(mobileNumber) {
    return this.findOne({ mobileNumber })
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  }
};

/**
 * @typedef PendingUser
 */
module.exports = mongoose.model('PendingUser', PendingUserSchema);
