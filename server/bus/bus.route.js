const express = require('express');
// const validate = require('express-validation');
// const paramValidation = require('@config/param-validation');
const busCtrl = require('./bus.controller');
const routeCtrl = require('@server/route/route.controller');
const config = require('@config/config');
const expressJwt = require('express-jwt');

const router = express.Router(); // eslint-disable-line new-cap

router
  .route('/')
  .get(busCtrl.list)
  .post(
    expressJwt({
      secret: config.jwtSecretRefresh
    }),
    // validate(paramValidation.createBus),
    busCtrl.create
  );

router
  .route('/:busId')
  .get(busCtrl.get)
  .delete(
    expressJwt({
      secret: config.jwtSecretRefresh
    }),
    busCtrl.remove
  );

router.param('busId', busCtrl.load);
router.param('routeId', routeCtrl.load);
module.exports = router;
