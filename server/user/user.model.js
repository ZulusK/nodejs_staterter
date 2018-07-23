const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
const bcrypt = require('bcrypt');
const privatePaths = require('mongoose-private-paths');
const config = require('@config/config');
const jwt = require('jsonwebtoken');
const mongoosePaginate = require('mongoose-paginate');
/**
 * @swagger
 * definitions:
 *  User:
 *    summary: Defines public user model
 *    type: object
 *    properties:
 *      email:
 *        type: string
 *        format: email
 *        example: "some.mail@mail.com"
 *      fullname:
 *        type: string
 *        example: "Johnny Stark"
 *      _id:
 *        type: string
 *        format: byte
 *        example: 507f1f77bcf86cd799439011
 *      isEmailConfirmed:
 *        type: boolean
 *      mobileNumber:
 *        type: string
 *        example: "+65 XXXX XXXX"
 *      securedCreditCardNumber:
 *        type: string
 *        example: "*1234"
 *      createdAt:
 *        type: string
 *        example: 'Fri Jul 13 2018 02:23:45'
 *        description: Date of user's account creation
 *      updatedAt:
 *        type: string
 *        example: 'Fri Jul 13 2018 02:23:45'
 *        description: Date of last user's account updates
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
    isEmailConfirmed: {
      type: Boolean,
      default: false
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      private: true
    },
    jwtSecret: {
      private: true,
      type: String
    },
    creditCard: {
      private: true,
      required: true,
      type: {
        number: {
          type: String,
          required: true
        },
        cvv: {
          type: String,
          required: true
        },
        expirationDate: {
          required: true,
          month: String,
          year: String
        }
      }
    }
  },
  { timestamps: true }
);
UserSchema.plugin(privatePaths);
UserSchema.plugin(mongoosePaginate);
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

UserSchema.virtual('securedCreditCardNumber').get(function getSecuredCreditCard() {
  return `*${this.creditCard.number.slice(-4)}`;
});
// Hash the user's password before inserting a new user
UserSchema.pre('save', function preSave(next) {
  if (this.isModified('password') || this.isNew) {
    bcrypt
      .hash(this.password, 10)
      .then((hp) => {
        this.password = hp;
        return bcrypt.genSalt(8);
      })
      .then((salt) => {
        this.jwtSecret = salt;
        next();
      });
  }
});

/**
 * Generate auth JWT tokens
 */
UserSchema.methods.genAuthTokens = function genAuthTokens() {
  return {
    access: this.genJWTAccessToken(),
    refresh: this.genJWTRefreshToken()
  };
};

/**
 * Generate activation token
 */
UserSchema.methods.genEmailActivationToken = function genEmailActivationToken() {
  return jwt.sign({ id: this.id }, config.jwtSecretEmailConfirmation);
};

/**
 * Generate access token
 */
UserSchema.methods.genJWTAccessToken = function genJWTAccessToken() {
  return {
    expiredIn: config.jwtExpAccess + Math.floor(Date.now() / 1000),
    token: jwt.sign({ id: this.id, secret: this.jwtSecret }, config.jwtSecretAccessUser, {
      expiresIn: config.jwtExpRefresh
    })
  };
};
/**
 * Generate refresh token
 */
UserSchema.methods.genJWTRefreshToken = function genJWTRefreshToken() {
  return {
    expiredIn: config.jwtExpRefresh + Math.floor(Date.now() / 1000),
    token: jwt.sign({ id: this.id, secret: this.jwtSecret }, config.jwtSecretRefreshUser, {
      expiresIn: config.jwtExpRefresh
    })
  };
};

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
    const user = await this.findOne({ email }).exec();
    if (user && (await user.comparePassword(password))) {
      return user;
    }
    const err = new APIError('No such user exists!', httpStatus.NOT_FOUND, true);
    throw err;
  },

  async getByToken(payload) {
    return this.findOne({ _id: payload.id, jwtSecret: payload.secret });
  },
  /**
   * Get entity by it's id
   * @param {ObjectId} id - The objectId of entity.
   * @returns {Promise<Route, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('No such user exists', httpStatus.NOT_FOUND, true);
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
