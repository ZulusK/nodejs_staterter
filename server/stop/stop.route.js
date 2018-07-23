const express = require('express');
// const validate = require('express-validation');
// const paramValidation = require('@config/param-validation');
const stopCtrl = require('./stop.controller');
// const config = require('@config/config');
// const authorization = require('@config/passport');

const router = express.Router();
/**
 * @swagger
 * /api/stops:
 *  get:
 *      tags:
 *      - Stop
 *      summary: Returns list of all stops
 *      parameters:
 *      - $ref: "#/parameters/limit-q"
 *      - $ref: "#/parameters/skip-q"
 *      - $ref: "#/parameters/populate-q"
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: list of stops
 *              schema:
 *                properties:
 *                  total:
 *                      type: integer
 *                  skip:
 *                      type: integer
 *                  limit:
 *                      type: integer
 *                  docs:
 *                      type: array
 *                      items:
 *                          $ref: "#/definitions/Stop"
 */
router.route('/').get(stopCtrl.list);
/**
 * @swagger
 * /api/stops/{id}:
 *  delete:
 *      security:
 *      - JWT:[]
 *      tags:
 *      - Stop
 *      summary: Delete stop by it's id
 *      description: send JWT access token in header
 *      parameters:
 *      - $ref: "#/parameters/id-p"
 *      produces:
 *          - application/json
 *      responses:
 *          401:
 *              $ref: "#/responses/401Response"
 *          404:
 *              $ref: "#/responses/404Response"
 *          200:
 *              description: Returns deleted stop
 *              schema:
 *                  $ref: "#/definitions/Stop"
 *  get:
 *      tags:
 *      - Stop
 *      summary: Get stop by id
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
 *              $ref: "#/responses/404Response"
 */
router.route('/:stopId').get(stopCtrl.get);

router.param('stopId', stopCtrl.load);
module.exports = router;
