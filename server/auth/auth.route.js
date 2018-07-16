require('module-alias/register');
const config = require('@config/config');
const express = require('express');
const validate = require('express-validation');
const expressJwt = require('express-jwt');
const paramValidation = require('@config/param-validation');
const authCtrl = require('./auth.controller');
const basicAuth = require('@config/basicAuth');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/confirm-phone').post(validate(paramValidation.confirmPhone), authCtrl.confirmPhone);

router.route('/signup').post(validate(paramValidation.signup), authCtrl.signup);

/**
 * @swagger
 * /api/auth/token:
 *  get:
 *      description: Returns new access in exchange of refresh token
 *      tags:
 *      - Auth
 *      security:
 *      - JWT: []
 *      produces:
 *          - application/json
 *      responses:
 *          401:
 *            $ref: "#/responses/Standard401Response"
 *          200:
 *              description: Returns new tokens
 *              schema:
 *                $ref: "#/definitions/Token"
 */
router.route('/token').get(
  expressJwt({
    secret: config.jwtSecretRefresh
  }),
  authCtrl.token
);
/**
 * @swagger
 * /api/auth/login:
 *  post:
 *      tags:
 *      - Auth
 *      security:
 *      - Basic
 *      description: Login into account
 *      parameters:
 *      - $ref: "#/parameters/email-b"
 *      - $ref: "#/parameters/password-b"
 *      produces:
 *          - application/json
 *      responses:
 *          401:
 *            $ref: "#/responses/Standard401Response"
 *          400:
 *            $ref: "#/responses/Standard400Response"
 *          200:
 *              description: Returns user and auth tokens
 *              schema:
 *                type: object
 *                properties:
 *                  user:
 *                    $ref: "#/definitions/User"
 *                  tokens:
 *                    $ref: "#/definitions/AuthTokens"
 */
router.route('/login').post(basicAuth, authCtrl.login);

/**
 * @swagger
 * /api/auth/check-access:
 *  get:
 *      tags:
 *      - Auth
 *      security:
 *      - JWT: []
 *      description: Protected route, used in access-token verification
 *      responses:
 *          401:
 *              $ref: "#/responses/Standard401Response"
 *          200:
 *              $ref: "#/responses/Standard200Response"
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
 *      description: Protected route, used in refresh-token verification
 *      responses:
 *          401:
 *              $ref: "#/responses/Standard401Response"
 *          200:
 *              $ref: "#/responses/Standard200Response"
 */
router.route('/check-refresh').get(
  expressJwt({
    secret: config.jwtSecretRefresh
  }),
  authCtrl.check
);

/**
 * @swagger
 * /api/auth/confirm-email:
 *  post:
 *      tags:
 *      - Auth
 *      security:
 *      - JWT: []
 *      description:
 *        Used in account activation, after email confirmation.
 *        Put token, which you had received in email letter, in headers
 *      responses:
 *          401:
 *              $ref: "#/responses/Standard401Response"
 *          200:
 *              $ref: "#/responses/Standard200Response"
 */
router.route('/confirm-email').post(
  expressJwt({
    secret: config.jwtSecretEmailConfirmation
  }),
  authCtrl.confirmMail
);

router.get('/confirm-email/:emailConfirmationToken', authCtrl.confirmMailUsingGETReq);
router.get('/deactivate-email/:emailConfirmationToken', authCtrl.deactivateMailUsingGETReq);

/**
 * @swagger
 * /api/auth/deactivate:
 *  post:
 *      tags:
 *      - Auth
 *      security:
 *      - JWT: []
 *      description:
 *        Used in account deactivation, if invalid email was used
 *        Put token, which you had received in email letter, in headers
 *      responses:
 *          401:
 *              $ref: "#/responses/Standard401Response"
 *          200:
 *              $ref: "#/responses/Standard200Response"
 */
router.route('/deactivate-email').post(
  expressJwt({
    secret: config.jwtSecretEmailConfirmation
  }),
  authCtrl.deleteAccount
);
router.param('emailConfirmationToken', authCtrl.loadUserFromConfirmationToken);
module.exports = router;
