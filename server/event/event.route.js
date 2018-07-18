const express = require('express');
// const validate = require('express-validation');
// const paramValidation = require('@config/param-validation');
const eventCtrl = require('./event.controller');
const config = require('@config/config');
const expressJwt = require('express-jwt');

const router = express.Router(); // eslint-disable-line new-cap
/**
 * @swagger
 * /api/events:
 *  get:
 *      tags:
 *      - Event
 *      summary: Returns list of all events
 *      parameters:
 *      - $ref: "#/parameters/limit-q"
 *      - $ref: "#/parameters/skip-q"
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: list of events
 *              schema:
 *                type: array
 *                items:
 *                  $ref: "#/definitions/Event"
 */
router.route('/').get(eventCtrl.list);
/**
 * @swagger
 * /api/stops/{id}:
 *  delete:
 *      security:
 *      - JWT:[]
 *      tags:
 *      - Event
 *      summary: Delete event by it's id
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
 *              description: Returns deleted event
 *              schema:
 *                  $ref: "#/definitions/Event"
 *  get:
 *      tags:
 *      - Stop
 *      summary: Get event by id
 *      parameters:
 *      - $ref: "#/parameters/id-p"
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Target event
 *              schema:
 *                  $ref: "#/definitions/Event-full"
 *          404:
 *              $ref: "#/responses/404Response"
 */
router
  .route('/:eventId')
  .get(eventCtrl.get)
  .delete(
    expressJwt({
      secret: config.jwtSecretRefresh
    }),
    eventCtrl.remove
  );
router.param('eventId', eventCtrl.load);
module.exports = router;
