const express = require('express');
// const validate = require('express-validation');
// const paramValidation = require('@config/param-validation');
const routeCtrl = require('./route.controller');
// const config = require('@config/config');
const busCtrl = require('@/bus/bus.controller');

const router = express.Router(); // eslint-disable-line new-cap

/**
 * @swagger
 * /api/routes:
 *  get:
 *      tags:
 *      - Route
 *      summary: Returns list of all routes
 *      parameters:
 *      - $ref: "#/parameters/limit-q"
 *      - $ref: "#/parameters/skip-q"
 *      - $ref: "#/parameters/populate-q"
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: list of routes
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
 *                          $ref: "#/definitions/Route"
 */

router.route('/').get(routeCtrl.list);

router.route('/:routeId').get(routeCtrl.get);
/**
 * @swagger
 * /api/routes/{id}/buses:
 *  get:
 *      tags:
 *      - Route
 *      - Bus
 *      summary: Returns list of all buses, on the route
 *      parameters:
 *      - $ref: "#/parameters/limit-q"
 *      - $ref: "#/parameters/skip-q"
 *      - $ref: "#/parameters/id-p"
 *      - $ref: "#/parameters/populate-p"
 *      produces:
 *          - application/json
 *      responses:
 *          400:
 *              $ref: "#/responses/400Response"
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
router.route('/:routeId/buses').get(busCtrl.listByRoute);

router.param('routeId', routeCtrl.load);
module.exports = router;
