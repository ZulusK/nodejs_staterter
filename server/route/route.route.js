const express = require('express');
const validate = require('express-validation');
const paramValidation = require('@config/param-validation');
const routeCtrl = require('./route.controller');
const config = require('@config/config');
const expressJwt = require('express-jwt');

const router = express.Router(); // eslint-disable-line new-cap

/**
 * @swagger
 * /api/routes:
 *  get:
 *      tags:
 *      - Stop
 *      description: Returns list of all routes
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
router
  .route('/')
  .get(routeCtrl.list)
  .post(
    expressJwt({
      secret: config.jwtSecretRefresh
    }),
    validate(paramValidation.createStop),
    routeCtrl.create
  );

/**
 * @swagger
 * /api/stops/{id}:
 *  delete:
 *      security:
 *      - JWT:[]
 *      tags:
 *      - Stop
 *      description: Returns list of all routes
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
 *              description: Returns deleted route
 *              schema:
 *                  $ref: "#/definitions/Route"
 *  get:
 *      tags:
 *      - Stop
 *      description: Get route by id
 *      parameters:
 *      - $ref: "#/parameters/id-p"
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Target stop
 *              schema:
 *                  $ref: "#/definitions/Route"
 *          404:
 *              $ref: "#/responses/Standard404Response"
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
