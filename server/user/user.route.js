const express = require('express');
const validate = require('express-validation');
const paramValidation = require('@config/param-validation');
const userCtrl = require('./user.controller');

const router = express.Router(); // eslint-disable-line new-cap
/**
 * @swagger
 * /api/users:
 *  get:
 *      tags:
 *      - User
 *      description: Returns list of entities
 *      parameters:
 *      - $ref: "#/parameters/limit"
 *      - $ref: "#/parameters/skip"
 *      produces:
 *          - application/json
 *      responses:
 *          400:
 *            $ref: "#/responses/Standard400Response"
 *          200:
 *              description: list of entities
 *              schema:
 *                type: array
 *                items:
 *                  $ref: "#/definitions/User"
 *  post:
 *      tags:
 *      - User
 *      - Auth
 *      security:
 *      - JWT: []
 *      description:
 *        Creates new user, you need to send back token,
 *        that had received after phone verification
 *      parameters:
 *      - $ref: "#/parameters/email-b"
 *      - $ref: "#/parameters/password-b"
 *      - $ref: "#/parameters/fullname-b"
 *      produces:
 *          - application/json
 *      responses:
 *          400:
 *            $ref: "#/responses/Standard400Response"
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

module.exports = router;
