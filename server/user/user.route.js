const express = require('express');
const validate = require('express-validation');
const paramValidation = require('@config/param-validation');
const userCtrl = require('./user.controller');

const router = express.Router(); // eslint-disable-line new-cap
/**
 * @swagger
 * /api/users:
 *  get:
 *      description: Returns list of all users
 *      parameters:
 *      - $ref: "#/parameters/limit"
 *      - $ref: "#/parameters/skip"
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: list of users
 *              schema:
 *                type: array
 *                items:
 *                  $ref: "#/definitions/User"
 *  post:
 *      description: Creates new user
 *      parameters:
 *      - $ref: "#/parameters/email-b"
 *      - $ref: "#/parameters/password-b"
 *      - $ref: "#/parameters/mobileNumber-b"
 *      - $ref: "#/parameters/username-b"
 *      produces:
 *          - application/json
 *      responses:
 *          400:
 *            $ref: "#/responses/Standard400ErrorResponse"
 *          200:
 *              description: Returns created user and auth tokens
 *              schema:
 *                type: object
 *                properties:
 *                  user:
 *                    $ref: "#/definitions/User"
 *                  tokens:
 *                    $ref: "#/definitions/AuthTokens"
 */
router
  .route('/')
  .get(userCtrl.list)
  .post(validate(paramValidation.createUser), userCtrl.create);

router.param('userId', userCtrl.load);

module.exports = router;
