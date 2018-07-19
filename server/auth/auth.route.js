require('module-alias/register');
const config = require('@config/config');
const expressJwt = require('express-jwt');
const express = require('express');
const validate = require('express-validation');
const paramValidation = require('@config/param-validation');
const authCtrl = require('./auth.controller');
const authorization = require('@config/passport');

const router = express.Router(); // eslint-disable-line new-cap

router
  .route('/login')
  .post(authorization.basicUser, authCtrl.login)
  .get(authorization.jwtUserAccess, authCtrl.me);

router.post('/confirm-phone', validate(paramValidation.confirmPhone), authCtrl.confirmPhone);
router.post('/signup', validate(paramValidation.signup), authCtrl.signup);
router.get('/token', authorization.jwtUserRefresh, authCtrl.token);
router.get('/check-access', authorization.jwtUserAccess, authCtrl.check);
router.get('/check-refresh', authorization.jwtUserRefresh, authCtrl.check);

router.post(
  '/confirm-email',
  expressJwt({
    secret: config.jwtSecretEmailConfirmation
  }),
  authCtrl.confirmMail
);
router.post(
  '/deactivate-email',
  expressJwt({
    secret: config.jwtSecretEmailConfirmation
  }),
  authCtrl.deleteAccount
);
router.get('/confirm-email/:emailConfirmationToken', authCtrl.confirmMailUsingGETReq);
router.get('/deactivate-email/:emailConfirmationToken', authCtrl.deactivateMailUsingGETReq);

router.param('emailConfirmationToken', authCtrl.loadUserFromConfirmationToken);
module.exports = router;
