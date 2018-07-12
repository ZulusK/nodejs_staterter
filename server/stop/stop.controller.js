const Stop = require('./stop.model');
const { ObjectId } = require('mongoose').Types;
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
// const config = require('@config/config');

/**
 * Load stop by id and append to req.
 */
function load(req, res, next, id) {
  if (!ObjectId.isValid(id)) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: 'Parameter id is not a valid object id' });
  }
  return Stop.get(id)
    .then((stop) => {
      req.$stop = stop; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(next);
}

/**
 * Get route
 * @returns {Stop}
 */
function get(req, res) {
  return res.json(req.$stop);
}

/**
 * Create new stop
 * @property {string} req.body.name - The name of stop.
 * @property {string} req.body.latitude - The latitude of stop.
 * @property {string} req.body.longitude - The longitude of stop.
 * @property {string} req.body.address - The address of stop.
 * @returns {Route}
 */
function create() {
  throw new APIError(httpStatus.NOT_IMPLEMENTED, null, true);
}

/**
 * Get docs list.
 * @property {number} req.query.skip - Number of docs to be skipped.
 * @property {number} req.query.limit - Limit number of docs to be returned.
 * @returns {User[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Stop.list({ limit, skip })
    .then(users => res.json(users))
    .catch(next);
}

function remove(req, res, next) {
  req.$stop
    .remove()
    .then(removedStop => res.json(removedStop.publicInfo()))
    .catch(next);
}
module.exports = {
  load,
  get,
  create,
  remove,
  list
};
