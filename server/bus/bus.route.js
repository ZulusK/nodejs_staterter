const express = require('express');
// const validate = require('express-validation');
// const paramValidation = require('@config/param-validation');
const busCtrl = require('./bus.controller');
const routeCtrl = require('@/route/route.controller');
// const config = require('@config/config');

const router = express.Router(); // eslint-disable-line new-cap
/**
 * @swagger
 * /api/buses:
 *  get:
 *      tags:
 *      - Bus
 *      summary: Returns list of all buses
 *      parameters:
 *      - $ref: "#/parameters/limit-q"
 *      - $ref: "#/parameters/skip-q"
 *      - $ref: "#/parameters/populate-q"
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: list of buses
 *              schema:
 *                type: object
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
 *                          $ref: "#/definitions/Bus"
 */
router.route('/').get(busCtrl.list);


/**
 * @swagger
 * /api/buses/{id}:
 *  delete:
 *      security:
 *      - JWT:[]
 *      tags:
 *      - Bus
 *      summary: Delete bus by it's id
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
 *              description: Returns deleted bus
 *              schema:
 *                  $ref: "#/definitions/Bus"
 *  get:
 *      tags:
 *      - Bus
 *      summary: Get bus by id
 *      parameters:
 *      - $ref: "#/parameters/id-p"
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Target bus
 *              schema:
 *                  $ref: "#/definitions/Bus-full"
 *          404:
 *              $ref: "#/responses/404Response"
 */
router.route('/:busId').get(busCtrl.get);


router.param('busId', busCtrl.load);
router.param('routeId', routeCtrl.load);
module.exports = router;
