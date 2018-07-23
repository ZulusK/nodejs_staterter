require('module-alias/register');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
const config = require('@config/config');
const User = require('@/user/user.model');
const PendingUser = require('@/pendingUser/pendingUser.model');
const jwt = require('jsonwebtoken');

function confirmPhone(req, res, next) {
  PendingUser.getByMobileNumber(req.body.mobileNumber)
    .then((user) => {
      if (user.checkOtp(req.body.otp)) {
        return res.json({ token: user.genActivationToken() });
      }
      throw APIError('Invalid one time password', httpStatus.BAD_REQUEST, true);
    })
    .catch(next);
}

function signup(req, res, next) {
  // check is user alredy exist in User DB
  User.findOne({ mobileNumber: req.body.mobileNumber })
    .exec()
    .then((user) => {
      if (user) {
        throw new APIError(
          'User with this mobile number already exist',
          httpStatus.BAD_REQUEST,
          true
        );
      } else {
        // create or return existing user
        return PendingUser.findOrCreate({ mobileNumber: req.body.mobileNumber });
      }
    })
    .then(pendingUser => pendingUser.sendOtpViaSMS())
    .then(otp => res.json({ otp: config.env !== 'production' ? otp : undefined }))
    .catch(next);
}

/**
 * Returns new generated access token
 */
function token(req, res) {
  return res.json(req.user.genJWTAccessToken());
}
/**
 * Returns jwt token if valid username and password is provided
 */
function login(req, res) {
  return res.json({
    user: req.user.toJSON(),
    tokens: req.user.genAuthTokens()
  });
}
/**
 * This is a protected route. Will return status:true if jwt token is provided in header.
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
    return next(new APIError('This email is already activated', httpStatus.BAD_REQUEST, true));
  }
  await user.update({ isEmailConfirmed: true });
  return res.json({ message: 'email activated' });
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

async function confirmMailUsingGETReq(req, res, next) {
  if (req.$user.isEmailConfirmed) {
    return next(new APIError('This email is already activated', httpStatus.BAD_REQUEST, true));
  }
  await req.$user.update({ isEmailConfirmed: true });
  return res.json({ message: 'email activated' });
}
async function deactivateMailUsingGETReq(req, res, next) {
  if (req.$user.isEmailConfirmed) {
    return next(new APIError('This account is already activated', httpStatus.BAD_REQUEST, true));
  }
  await req.$user.remove();
  return res.json({ message: 'deleted' });
}
function loadUserFromConfirmationToken(req, res, next, JWTtoken) {
  try {
    const decoded = jwt.verify(JWTtoken, config.jwtSecretEmailConfirmation);
    return User.get(decoded.id)
      .then((user) => {
        req.$user = user;
        return next();
      })
      .catch(next);
  } catch (err) {
    return next(new APIError('Invalid token', httpStatus.BAD_REQUEST, true));
  }
}
function me(req, res) {
  return res.json(req.user.toJSON);
}
module.exports = {
  me,
  deactivateMailUsingGETReq,
  loadUserFromConfirmationToken,
  confirmMailUsingGETReq,
  confirmPhone,
  signup,
  check,
  login,
  token,
  confirmMail,
  deleteAccount
};
