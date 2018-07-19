const express = require('express');
const validate = require('express-validation');
const paramValidation = require('@config/param-validation');
const userCtrl = require('./user.controller');
const config = require('@config/config');
const expressJwt = require('express-jwt');
const authorization = require('@config/passport');

const router = express.Router(); // eslint-disable-line new-cap

/**
 * @swagger
 * /api/users:
 *  post:
 *    summary: create new user
 *    description: send token, received after phone verification
 *    tags:
 *    - User
 *    security:
 *    - JWT: []
 *    produces:
 *    - application/json
 *    parameters:
 *    - $ref: "#/parameters/email-b"
 *    - $ref: "#/parameters/fullname-b"
 *    - $ref: "#/parameters/password-b"
 *    - $ref: "#/parameters/creditCardNumber-b"
 *    - $ref: "#/parameters/creditCardCVV-b"
 *    - $ref: "#/parameters/creditCardExpDate-b"
 *    responses:
 *      400:
 *        $ref: "#/responses/400Response"
 *      401:
 *        $ref: "#/responses/401Response"
 *      200:
 *        description: Returns new token
 *        schema:
 *          type: object
 *          properties:
 *            user:
 *              $ref: "#/definitions/User"
 *            tokens:
 *              $ref: "#/definitions/AuthTokens"
 *  delete:
 *    summary: delete user
 *    description: send email & password in header
 *    tags:
 *    - User
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
 *        description: Returns new token
 *        schema:
 *          $ref: "#/definitions/User"
 */
router
  .route('/')
  .post(
    expressJwt({
      secret: config.jwtSecretPhoneConfirmation
    }),
    validate(paramValidation.createUser),
    userCtrl.create
  )
  .delete(authorization.basicUser, userCtrl.remove);

module.exports = router;
