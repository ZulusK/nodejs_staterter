const express = require('express');
// const validate = require('express-validation');
// const paramValidation = require('@config/param-validation');
const busCtrl = require('./bus.controller');
const routeCtrl = require('@/route/route.controller');
// const config = require('@config/config');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/').get(busCtrl.list);

router.route('/:busId').get(busCtrl.get);

router.param('busId', busCtrl.load);
router.param('routeId', routeCtrl.load);
module.exports = router;
