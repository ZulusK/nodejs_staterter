require('module-alias/register');
const config = require('@config/config');
const express = require('express');
const validate = require('express-validation');
const expressJwt = require('express-jwt');
const paramValidation = require('@config/param-validation');
const authCtrl = require('./auth.controller');
const basicAuth = require('@config/basicAuth');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/confirm-phone').post(validate(paramValidation.confirmPhone), authCtrl.confirmPhone);

router.route('/signup').post(validate(paramValidation.signup), authCtrl.signup);

router.route('/token').get(
  expressJwt({
    secret: config.jwtSecretRefresh
  }),
  authCtrl.token
);

router
  .route('/login')
  .post(basicAuth, authCtrl.login)
  .get(
    expressJwt({
      secret: config.jwtSecretAccess
    }),
    authCtrl.me
  );

router.route('/check-access').get(
  expressJwt({
    secret: config.jwtSecretAccess
  }),
  authCtrl.check
);

router.route('/check-refresh').get(
  expressJwt({
    secret: config.jwtSecretRefresh
  }),
  authCtrl.check
);

router.route('/confirm-email').post(
  expressJwt({
    secret: config.jwtSecretEmailConfirmation
  }),
  authCtrl.confirmMail
);

router.get('/confirm-email/:emailConfirmationToken', authCtrl.confirmMailUsingGETReq);
router.get('/deactivate-email/:emailConfirmationToken', authCtrl.deactivateMailUsingGETReq);

router.route('/deactivate-email').post(
  expressJwt({
    secret: config.jwtSecretEmailConfirmation
  }),
  authCtrl.deleteAccount
);

router.param('emailConfirmationToken', authCtrl.loadUserFromConfirmationToken);
module.exports = router;
