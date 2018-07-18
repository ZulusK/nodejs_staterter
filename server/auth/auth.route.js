require('module-alias/register');
const config = require('@config/config');
const express = require('express');
const validate = require('express-validation');
const expressJwt = require('express-jwt');
const paramValidation = require('@config/param-validation');
const authCtrl = require('./auth.controller');
const basicAuth = require('@config/basicAuth');

const router = express.Router(); // eslint-disable-line new-cap

/**
 * @swagger
 * /api/auth/confirm-phone:
 *  post:
 *    summary: confirm phone number
 *    description: send OTP in body, received on mobile phone
 *    tags:
 *    - Auth
 *    security:
 *    - JWT: []
 *    produces:
 *    - application/json
 *    parameters:
 *    - $ref: "#/parameters/otp-b"
 *    responses:
 *    401:
 *      $ref: "#/responses/401Response"
 *    200:
 *      description: Returns new token
 *      schema:
 *        $ref: "#/definitions/Token"
 */
router.route('/confirm-phone').post(validate(paramValidation.confirmPhone), authCtrl.confirmPhone);

/**
 * @swagger
 * /api/auth/signup:
 *  post:
 *    summary: send OTP on mobile number
 *    description: you can use this route no more than one time each 30 s
 *    tags:
 *    - Auth
 *    produces:
 *    - application/json
 *    parameters:
 *    - $ref: "#/parameters/mobileNumber-b"
 *    responses:
 *        400:
 *          $ref: "#/responses/400Response"
 *        401:
 *          $ref: "#/responses/401Response"
 *        200:
 *          description:
 *            Empty response, check your
 *            mobile phone. You will receive OTP via SMS
 */
router.route('/signup').post(validate(paramValidation.signup), authCtrl.signup);

/**
 * @swagger
 * /api/auth/token:
 *  get:
 *    summary: get new JWT access token
 *    description: send JWT refresh token
 *    security:
 *    - JWT:[]
 *    tags:
 *    - Auth
 *    produces:
 *    - application/json
 *    responses:
 *      400:
 *        $ref: "#/responses/400Response"
 *      401:
 *        $ref: "#/responses/401Response"
 *      200:
 *        description: Returns new access token
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
 *    summary: login in application,
 *    description: get profile & tokens, send email and password in header
 *    tags:
 *    - Auth
 *    security:
 *    - Basic: []
 *    produces:
 *    - application/json
 *    responses:
 *      400:
 *        $ref: "#/responses/400Response"
 *      401:
 *        $ref: "#/responses/401Response"
 *      200:
 *        description: Returns new user's profile and tokens
 *        schema:
 *        type: object
 *        properties:
 *        - $ref: "#/definitions/AuthTOkens"
 *        - $ref: "#/definitions/User"
 *  get:
 *    summary: Get user profile
 *    description: send JWT access token in header
 *    tags:
 *    - Auth
 *    security:
 *    - JWT: []
 *    produces:
 *    - application/json
 *    responses:
 *      400:
 *        $ref: "#/responses/400Response"
 *      401:
 *        $ref: "#/responses/401Response"
 *      200:
 *        description: Returns new user's profile and tokens
 *        schema:
 *          $ref: "#/definitions/User"
 */
router
  .route('/login')
  .post(basicAuth, authCtrl.login)
  .get(
    expressJwt({
      secret: config.jwtSecretAccess
    }),
    authCtrl.me
  );
/**
 * @swagger
 * /api/auth/check-access:
 *  post:
 *    summary: check access-token
 *    description: send JWT access token in header
 *    tags:
 *    - Auth
 *    security:
 *    - JWT: []
 *    produces:
 *    - application/json
 *    responses:
 *      401:
 *        $ref: "#/responses/401Response"
 *      200:
 *        $ref: "#/responses/200Response"
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
 *  post:
 *    summary: check refresh-token
 *    description: send JWT refresh token in header
 *    tags:
 *    - Auth
 *    security:
 *    - JWT: []
 *    produces:
 *    - application/json
 *    responses:
 *      401:
 *        $ref: "#/responses/401Response"
 *      200:
 *        $ref: "#/responses/200Response"
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
 *    summary: activate email
 *    description: send token, received on email
 *    tags:
 *    - Auth
 *    security:
 *    - JWT: []
 *    produces:
 *    - application/json
 *    responses:
 *      401:
 *        $ref: "#/responses/401Response"
 *      200:
 *        $ref: "#/responses/200Response"
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
 * /api/auth/deactivate-email:
 *  post:
 *    summary: deactivate emai
 *    description:
 *      send token, received on email.
 *      After this action, account will be removed
 *    tags:
 *    - Auth
 *    security:
 *    - JWT: []
 *    produces:
 *    - application/json
 *    responses:
 *      401:
 *        $ref: "#/responses/401Response"
 *      200:
 *        $ref: "#/responses/200Response"
 */
router.route('/deactivate-email').post(
  expressJwt({
    secret: config.jwtSecretEmailConfirmation
  }),
  authCtrl.deleteAccount
);

router.param('emailConfirmationToken', authCtrl.loadUserFromConfirmationToken);
module.exports = router;
