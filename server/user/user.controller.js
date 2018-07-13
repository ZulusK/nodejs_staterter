const User = require('./user.model');
const PendingUser = require('@server/pendingUser/pendingUser.model');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
const mailer = require('@server/mailer');
const config = require('@config/config');

function load(req, res, next, id) {
  User.get(id)
    .then((user) => {
      req.$user = user; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(next);
}

function get(req, res) {
  return res.json(req.$user);
}

/**
 * check, is user with this email is alredy exist
 */
function checkEmailAvailability(email) {
  return User.findOne({ email })
    .exec()
    .then((user) => {
      if (user) {
        throw new APIError('User with this email is already exist', httpStatus.BAD_REQUEST, true);
      }
    });
}

function removePendingUser(id) {
  // remove pending user and return him
  return PendingUser.get(id).then(pendingUser => pendingUser.remove());
}
/**
 * create new user and save him
 */
function createNewUser({ req, pendingUser }) {
  return new User({
    email: req.body.email,
    fullname: req.body.fullname,
    mobileNumber: pendingUser.mobileNumber,
    password: req.body.password
  }).save();
}

async function create(req, res, next) {
  checkEmailAvailability(req.body.email)
    .then(() => removePendingUser(req.user.id))
    .then(pendingUser => createNewUser({ req, pendingUser }))
    .then((user) => {
      const emailActivationToken = user.genActivationToken();
      // send email activation letter
      mailer.sendEmailActivation({
        email: user.email,
        fullname: user.fullname,
        token: emailActivationToken
      });
      if (config.env !== 'production') {
        // send user info and email activation back token to user
        return res.json({
          user: user.toJSON(),
          tokens: user.genAuthTokens(),
          token: emailActivationToken
        });
      }
      // send only to user info back to user
      return res.json({
        user: user.toJSON(),
        tokens: user.genAuthTokens()
      });
    })
    .catch(next);
}

function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  User.list({ limit, skip })
    .then(users => res.json(users.map(x => x.toJSON())))
    .catch(next);
}

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
