const express = require('express');
// const validate = require('express-validation');
// const paramValidation = require('@config/param-validation');
const routeCtrl = require('./route.controller');
// const config = require('@config/config');
const busCtrl = require('@/bus/bus.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/').get(routeCtrl.list);

router.route('/:routeId').get(routeCtrl.get);
router.route('/:routeId/buses').get(busCtrl.listByRoute);

router.param('routeId', routeCtrl.load);
module.exports = router;
