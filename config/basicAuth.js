const auth = require('basic-auth');
const User = require('@server/user/user.model');
const APIError = require('@helpers/APIError');
const httpStatus = require('http-status');

module.exports = (req, res, next) => {
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
};
