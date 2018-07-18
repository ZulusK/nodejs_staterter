const auth = require('basic-auth');
const User = require('@server/user/user.model');
const APIError = require('@helpers/APIError');
const httpStatus = require('http-status');

/**
 * Authentificate user in request, usign basic auth
 * @module config
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function basicAuth(req, res, next) {
  try {
    const { name: email, pass: password } = auth(req);
    return User.getByCredentials({ email, password })
      .then((user) => {
        req.user = user;
        return next(null, user);
      })
      .catch(() => next(new APIError('Authentication error', httpStatus.UNAUTHORIZED, true)));
  } catch (err) {
    return next(new APIError('Authentication error', httpStatus.UNAUTHORIZED, true));
  }
}
module.exports = basicAuth;
