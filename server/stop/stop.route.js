const express = require('express');
const validate = require('express-validation');
const paramValidation = require('@config/param-validation');
const stopCtrl = require('./stop.controller');
const config = require('@config/config');
const expressJwt = require('express-jwt');

const router = express.Router(); // eslint-disable-line new-cap
/**
 * @swagger
 * /api/stops:
 *  get:
 *      tags:
 *      - Stop
 *      description: Returns list of all stops
 *      parameters:
 *      - $ref: "#/parameters/limit"
 *      - $ref: "#/parameters/skip"
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: list of stops
 *              schema:
 *                type: array
 *                items:
 *                  $ref: "#/definitions/Stop"
 *  post:
 *      tags:
 *      - Stop
 *      security:
 *      - JWT:[]
 *      description: Creates new stop
 *      parameters:
 *      - $ref: "#/parameters/address-b"
 *      - $ref: "#/parameters/name-b"
 *      - $ref: "#/parameters/latitude-b"
 *      - $ref: "#/parameters/longitude-b"
 *      produces:
 *          - application/json
 *      responses:
 *          401:
 *            $ref: "#/responses/Standard401Response"
 *          400:
 *            $ref: "#/responses/Standard400Response"
 *          200:
 *              description: Returns created stop
 *              schema:
 *                  $ref: "#/definitions/Stop"
 */
router
  .route('/')
  .get(stopCtrl.list)
  .post(
    expressJwt({
      secret: config.jwtSecretRefresh
    }),
    validate(paramValidation.createStop),
    stopCtrl.create
  );

/**
 * @swagger
 * /api/stops/{id}:
 *  delete:
 *      security:
 *      - JWT:[]
 *      tags:
 *      - Stop
 *      description: Returns list of all stops
 *      parameters:
 *      - $ref: "#/parameters/id-p"
 *      produces:
 *          - application/json
 *      responses:
 *          401:
 *              $ref: "#/responses/Standard401Response"
 *          404:
 *              $ref: "#/responses/Standard404Response"
 *          200:
 *              description: Returns deleted stop
 *              schema:
 *                  $ref: "#/definitions/Stop"
 *  get:
 *      tags:
 *      - Stop
 *      description: Get stop by id
 *      parameters:
 *      - $ref: "#/parameters/id-p"
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Target stop
 *              schema:
 *                  $ref: "#/definitions/Stop"
 *          404:
 *              $ref: "#/responses/Standard404Response"
 */

router
  .route('/:stopId')
  .get(stopCtrl.get)
  .delete(
    expressJwt({
      secret: config.jwtSecretRefresh
    }),
    stopCtrl.remove
  );

router.param(':stopId', validate(paramValidation.stopIdParam), stopCtrl.get);
module.exports = router;
