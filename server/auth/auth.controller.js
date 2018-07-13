require('module-alias/register');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
// const config = require('@config/config');
const User = require('@server/user/user.model');
const PendingUser = require('@server/pendingUser/pendingUser.model');

function signup(req, res, next) {
  // check is user alredy registered in User DB
  User.findOne({ mobileNumber: req.body.mobileNumber })
    .exec()
    .then((user) => {
      if (user) {
        throw new APIError(
          httpStatus.FORBIDDEN,
          'User with this mobile number already exist',
          true
        );
      } else {
        return PendingUser.findOrCreate({ mobileNumber: req.body.mobileNumber });
      }
    })
    // create or return existing user
    .then(pendingUser => pendingUser.sendOtpViaSMS())
    .then(() => res.status(httpStatus.OK).send())
    .catch(next);
}

/**
 * Returns new generated access token
 */
function token(req, res, next) {
  User.findById(req.user.id)
    .exec()
    .then(user => res.json(user.genJWTAccessToken()))
    .catch(next);
}
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
/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
 */
function check(req, res) {
  return res.json({
    status: true
  });
}

/**
 * Activate account
 */
async function confirmMail(req, res, next) {
  const user = await User.findById(req.user.id).exec();
  if (user.isEmailConfirmed) {
    return next(new APIError('This account is already activated', httpStatus.BAD_REQUEST, true));
  }
  await user.update({ isEmailConfirmed: true });
  return res.json({ message: 'activated' });
}

/**
 * Deactivate account
 */
async function deleteAccount(req, res, next) {
  const user = await User.findById(req.user.id).exec();
  if (!user) {
    return next(new APIError('This account is already deactivated', httpStatus.BAD_REQUEST, true));
  }
  if (user.isEmailConfirmed) {
    return next(new APIError('This account is already activated', httpStatus.BAD_REQUEST, true));
  }
  await user.remove();
  return res.json({ message: 'deleted' });
}

module.exports = {
  signup,
  check,
  login,
  token,
  confirmMail,
  deleteAccount
};
