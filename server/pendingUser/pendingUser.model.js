const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
const config = require('@config/config');
const jwt = require('jsonwebtoken');
const Messanger = require('@server/messanger');

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
    type: [Date],
    default: []
  }
});

PendingUserSchema.method('genOtpSMS', function genOtpSMS() {
  const body = `Here is your activation code\n${this.otp}\nYours Rush-Owl `;
  return body;
});

PendingUserSchema.method('sendOtpViaSMS', function sendOtpViaSMS() {
  this.otp = Math.floor(Math.random() * (Math.pow(10, config.otpLen - 1) * 9))
    + Math.pow(10, config.otpLen - 1);
  return this.save().then(() => Messanger.sendSMS({
    to: this.mobileNumber,
    body: this.genOtpSMS()
  }));
});
/**
 * Updates times of received sms by user
 */
PendingUserSchema.method('updateSMSTimings', function updateSMSTimings() {});
/**
 * Check, can user receive sms
 */
PendingUserSchema.method('canReceiveSMS', function canReceiveSMS() {
  //   this.updateSMSTimings().then();
  //   if (this.sms.timeOfMessageSending.length < config.smsLimitPerHour) {
  //   }
});
/**
 * Generate activation token
 */
PendingUserSchema.method('genActivationToken', function genActivationToken() {
  return jwt.sign({ id: this.id }, config.jwtSecretPhoneConfirmation);
});

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
