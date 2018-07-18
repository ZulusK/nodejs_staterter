const express = require('express');
// const validate = require('express-validation');
// const paramValidation = require('@config/param-validation');
const routeCtrl = require('./route.controller');
const config = require('@config/config');
const expressJwt = require('express-jwt');
const busCtrl = require('@server/bus/bus.controller');

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
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: list of routes
 *              schema:
 *                type: array
 *                items:
 *                  $ref: "#/definitions/Route"
 */
router.route('/').get(routeCtrl.list);

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
 *      produces:
 *          - application/json
 *      responses:
 *          400:
 *              $ref: "#/responses/400Response"
 *          200:
 *              description: list of buses
 *              schema:
 *                type: array
 *                items:
 *                  $ref: "#/definitions/Bus"
 */
router.route('/:routeId/buses').get(busCtrl.listByRoute);
/**
 * @swagger
 * /api/routes/{id}:
 *  delete:
 *      security:
 *      - JWT:[]
 *      tags:
 *      - Route
 *      summary: Delete route by it's id
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
 *              description: Returns deleted route
 *              schema:
 *                  $ref: "#/definitions/Route"
 *  get:
 *      tags:
 *      - Route
 *      summary: Get route by id
 *      parameters:
 *      - $ref: "#/parameters/id-p"
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Target stop
 *              schema:
 *                  $ref: "#/definitions/Route-full"
 *          404:
 *              $ref: "#/responses/404Response"
 */
router
  .route('/:routeId')
  .get(routeCtrl.get)
  .delete(
    expressJwt({
      secret: config.jwtSecretRefresh
    }),
    routeCtrl.remove
  );

router.param('routeId', routeCtrl.load);
module.exports = router;
