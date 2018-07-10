require('module-alias/register');
const config = require('@config/config');
const express = require('express');
// const validate = require('express-validation');
const expressJwt = require('express-jwt');
// const paramValidation = require('@config/param-validation');
const authCtrl = require('./auth.controller');

const router = express.Router(); // eslint-disable-line new-cap

/** POST /api/auth/login - Returns token if correct username and password is provided */
// router.route('/login').post(validate(paramValidation.login), authCtrl.login);

/** GET /api/auth/ - Returns users */
// router.route('/login').get(
//   expressJwt({
//     secret: config.jwtSecret
//   }),
//   authCtrl.get
// );

/**
 * @swagger
 * /api/auth/check-access:
 *  get:
 *      tags:
 *      - Auth
 *      security:
 *      - JWT: []
 *      description: Protected route, used to access-token verification
 *      responses:
 *          401:
 *              $ref: "#/responses/Standard401ErrorResponse"
 *          200:
 *              $ref: "#/responses/Standard200ErrorResponse"
 */
router.route('/check-access').get(
  expressJwt({
    secret: config.jwtSecretAccess
  }),
  authCtrl.check
);

/**
 * @swagger
 * /api/auth/check-refresh:
 *  get:
 *      tags:
 *      - Auth
 *      security:
 *      - JWT: []
 *      description: Protected route, used to refresh-token verification
 *      responses:
 *          401:
 *              $ref: "#/responses/Standard401ErrorResponse"
 *          200:
 *              $ref: "#/responses/Standard200ErrorResponse"
 */
router.route('/check-refresh').get(
  expressJwt({
    secret: config.jwtSecretRefresh
  }),
  authCtrl.check
);

module.exports = router;
