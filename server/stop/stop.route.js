const express = require('express');
const validate = require('express-validation');
const paramValidation = require('@config/param-validation');
const stopCtrl = require('./stop.controller');
const config = require('@config/config');
const expressJwt = require('express-jwt');

const router = express.Router(); // eslint-disable-line new-cap

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

router
  .route('/:stopId')
  .get(stopCtrl.get)
  .delete(
    expressJwt({
      secret: config.jwtSecretRefresh
    }),
    stopCtrl.remove
  );

router.param('stopId', stopCtrl.load);
module.exports = router;
