const express = require('express');
// const validate = require('express-validation');
// const paramValidation = require('@config/param-validation');
const stopCtrl = require('./stop.controller');
// const config = require('@config/config');
// const authorization = require('@config/passport');

const router = express.Router();

router.route('/').get(stopCtrl.list);

router.route('/:stopId').get(stopCtrl.get);

router.param('stopId', stopCtrl.load);
module.exports = router;
