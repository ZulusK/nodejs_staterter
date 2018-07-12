const User = require('./user.model');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
const mailer = require('@server/mailer');
const config = require('@config/config');
/**
 * Load user and append to req.
 */
function load(req, res, next, id) {
  User.get(id)
    .then((user) => {
      req.$user = user; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(next);
}

/**
 * Get user
 * @returns {User}
 */
function get(req, res) {
  return res.json(req.$user);
}

/**
 * Create new user
 * @property {string} req.body.email - The email of user.
 * @property {string} req.body.fullname - The username of user.
 * @property {string} req.body.mobileNumber - The mobileNumber of user.
 * @property {string} req.body.password - The password of user.
 * @returns {User}
 */
function create(req, res, next) {
  // check is user alredy exist
  return User.findOne({ $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber }] })
    .exec()
    .then((result) => {
      // create new user and save him
      if (result === null) {
        const user = new User({
          email: req.body.email,
          fullname: req.body.fullname,
          mobileNumber: req.body.mobileNumber,
          password: req.body.password
        });
        return user.save();
      }
      throw new APIError('User with this info is already exist', httpStatus.BAD_REQUEST);
    })
    .then((user) => {
      // send letter via mailer
      const token = user.genActivationToken();
      // user.password = undefined; // eslint-disable-line no-param-reassign
      mailer.sendEmailActivation({
        email: user.email,
        fullname: user.fullname,
        token
      });
      if (config.env !== 'production') {
        // send message and activation token to user
        return res.json({
          user: user.toJSON(),
          tokens: user.genAuthTokens(),
          token
        });
      }
      // send only message to user
      return res.json({
        user: user.toJSON(),
        tokens: user.genAuthTokens()
      });
    })
    .catch(next);
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  User.list({ limit, skip })
    .then(users => res.json(users.map(x => x.toJSON())))
    .catch(next);
}

/**
 * Delete user.
 * @returns {User}
 */

function remove(req, res, next) {
  const { user } = req;
  user
    .remove()
    .then(deletedUser => res.json(deletedUser))
    .catch(next);
}

module.exports = {
  load,
  get,
  create,
  list,
  remove
};
