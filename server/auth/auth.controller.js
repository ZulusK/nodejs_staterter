require('module-alias/register');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
// const config = require('@config/config');
const User = require('@server/user/user.model');

/**
 * Returns jwt token if valid username and password is provided
 */
function login(req, res, next) {
  User.getByCredentials(req.body)
    .then(user => res.json({
      user: user.publicInfo(),
      tokens: user.genAuthTokens()
    }))
    .catch(() => {
      const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
      return next(err);
    });
}
// /**
//  * Returns user
//  */
// function get(req, res) {
//   // req.user is assigned by jwt middleware if valid token is provided
//   return res.json({
//     ...req.user.user,
//     password: undefined
//   });
// }

// /**
//  * This is a protected route. Will return random number only if jwt token is provided in header.
//  */
function check(req, res) {
  return res.json({
    status: true
  });
}

module.exports = { check, login };
