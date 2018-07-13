const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
const config = require('@config/config');
const jwt = require('jsonwebtoken');
const Messanger = require('@server/messanger');
const _ = require('lodash');

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
    type: String
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

function genOpt() {
  return (
    Math.floor(Math.random() * (Math.pow(10, config.otpLen - 1) * 9))
    + Math.pow(10, config.otpLen - 1)
  );
}

PendingUserSchema.methods.sendOtpViaSMS = function sendOtpViaSMS() {
  if (this.canReceiveSMS()) {
    this.otp = genOpt();
    this.timeOfMessageSending.push(Date.now());
    return this.save().then(() => Messanger.sendSMS({
      to: this.mobileNumber,
      body: this.genOtpSMS()
    }));
  }
  return null;
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
 * Generate activation token
 */
PendingUserSchema.methods.genActivationToken = function genActivationToken() {
  return jwt.sign({ id: this.id }, config.jwtSecretPhoneConfirmation);
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
      .deselect(['password'])
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
  },

  /**
   * List entities in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of entities to be skipped.
   * @param {number} limit - Limit number of entities to be returned.
   * @returns {Promise<route[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .deselect(['otp'])
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

/**
 * @typedef PendingUser
 */
module.exports = mongoose.model('PendingUser', PendingUserSchema);
