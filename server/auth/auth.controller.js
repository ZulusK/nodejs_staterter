// const jwt = require('jsonwebtoken');
// const httpStatus = require('http-status');
// const APIError = require('../helpers/APIError');
// const config = require('../../config/config');
// const User = require('../user/user.model');

/**
 * Returns jwt token if valid username and password is provided
 */
// function login(req, res, next) {
//   User.getByEmail(req.body.email)
//     .then(user => user.comparePassword(req.body.password))
//     .then((user) => {
//       const token = jwt.sign(
//         {
//           user
//         },
//         config.jwtSecret
//       );

//       return res.json({
//         token,
//         user
//       });
//     })
//     .catch(() => {
//       const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
//       return next(err);
//     });
// }

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
// function getRandomNumber(req, res) {
//   // req.user is assigned by jwt middleware if valid token is provided
//   return res.json({
//     user: { ...req.user.user, password: undefined },
//     num: Math.random() * 100
//   });
// }

// module.exports = { login, get, getRandomNumber };
