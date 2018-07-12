const Route = require('./route.model');
const { ObjectId } = require('mongoose').Types;
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
// const config = require('@config/config');

/**
 * Load route by id and append to req.
 */
function load(req, res, next, id) {
  if (!ObjectId.isValid(id)) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: 'Parameter id is not a valid object id' });
  }
  return Route.get(id)
    .then((route) => {
      req.$route = route; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(next);
}

/**
 * Get route
 * @returns {route}
 */
function get(req, res) {
  return res.json(req.$route.toJSON());
}

/**
 * Create new route
 * @property {string} req.body.name - The name of route.
 * @property {string} req.body.latitude - The latitude of route.
 * @property {string} req.body.longitude - The longitude of route.
 * @property {string} req.body.address - The address of route.
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
  Route.list({ limit, skip })
    .then(docs => res.json(docs.map(d => d.toJSON())))
    .catch(next);
}

function remove(req, res, next) {
  req.$route
    .remove()
    .then(removedRoute => res.json(removedRoute.toJSON()))
    .catch(next);
}
module.exports = {
  load,
  get,
  create,
  remove,
  list
};
