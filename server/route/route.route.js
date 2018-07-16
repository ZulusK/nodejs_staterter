const express = require('express');
const validate = require('express-validation');
const paramValidation = require('@config/param-validation');
const routeCtrl = require('./route.controller');
const config = require('@config/config');
const expressJwt = require('express-jwt');
const busCtrl = require('@server/bus/bus.controller');

const router = express.Router(); // eslint-disable-line new-cap

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

router.route('/:routeId/buses').get(busCtrl.listByRoute);

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
