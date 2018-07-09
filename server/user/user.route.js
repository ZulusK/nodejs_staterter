const express = require('express');
const validate = require('express-validation');
const paramValidation = require('@config/param-validation');
const userCtrl = require('./user.controller');

const router = express.Router(); // eslint-disable-line new-cap
/**
 * @swagger
 * /api/users:
 *  get:
 *      description: Get list of all users
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: list of users
 */
router
  .route('/')
  .get(userCtrl.list)
  .post(validate(paramValidation.createUser), userCtrl.create);

router.param('userId', userCtrl.load);

module.exports = router;
