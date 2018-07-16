const express = require('express');
// const validate = require('express-validation');
// const paramValidation = require('@config/param-validation');
const eventCtrl = require('./event.controller');
const config = require('@config/config');
const expressJwt = require('express-jwt');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/').get(eventCtrl.list);

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
