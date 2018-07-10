const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
const bcrypt = require('bcrypt');

const config = require('@config/config');
const jwt = require('jsonwebtoken');
/**
 * @swagger
 *  definitions:
 *      User:
 *        description: User public model
 *        type: object
 *        required:
 *          - id
 *          - email
 *          - fullname
 *          - mobileNumber
 *        properties:
 *          id:
 *              type: string
 *              format: byte
 *              example: 507f1f77bcf86cd799439011
 *          email:
 *              type: string
 *              format: email
 *              example: example@mail.com
 *          fullname:
 *              example: John Smith
 *              type: string
 *          mobileNumber:
 *              type: string
 *          updatedAt:
 *              type: integer
 *              format: int64
 *          createdAt:
 *              type: integer
 *              format: int64
 */
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
      required: true
    },
    fullname: {
      trim: true,
      type: String,
      required: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    mobileNumber: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

// Hash the user's password before inserting a new user
UserSchema.pre('save', function preSave(next) {
  if (this.isModified('password') || this.isNew) {
    bcrypt.hash(this.password, 10).then((hp) => {
      this.password = hp;
      next();
    });
  }
});

/* eslint-disable func-names */
/**
 *  Get only public info about user
 */
UserSchema.method('publicInfo', function () {
  const {
    createdAt, updatedAt, fullname, email, mobileNumber, _id: id
  } = this;
  return {
    createdAt,
    updatedAt,
    fullname,
    email,
    mobileNumber,
    id
  };
});

/**
 * Generate auth JWT tokens
 */
UserSchema.method('genAuthTokens', function () {
  return {
    access: this.genJWTAccessToken(),
    refresh: this.genJWTRefreshToken()
  };
});

/**
 * Generate access token
 */
UserSchema.method('genJWTAccessToken', function () {
  return {
    expiredIn: config.jwtExpAccess + Math.floor(Date.now() / 1000),
    token: jwt.sign({ id: this.id }, config.jwtSecretAccess, {
      expiresIn: config.jwtExpRefresh
    })
  };
});
/**
 * Generate refresh token
 */
UserSchema.method('genJWTRefreshToken', function () {
  return {
    expiredIn: config.jwtExpRefresh + Math.floor(Date.now() / 1000),
    token: jwt.sign({ id: this.id }, config.jwtSecretRefresh, { expiresIn: config.jwtExpRefresh })
  };
});

// Compare password input to password saved in database
UserSchema.methods.comparePassword = function comparePassword(pw) {
  return bcrypt.compare(pw, this.password);
};

/**
 * Statics
 */
UserSchema.statics = {
  /** Get user by his email and password
   * @param {password} - password
   * @param {email} -email
   */
  async getByCredentials({ email, password }) {
    const user = await this.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      return user;
    }
    const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
    return Promise.reject(err);
  },
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
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

  getByEmail(email) {
    return this.findOne({ email })
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
   * List users in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

/**
 * @typedef User
 */
module.exports = mongoose.model('User', UserSchema);
