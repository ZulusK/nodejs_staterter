const Route = require('./route.model');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
// const config = require('@config/config');

/**
 * Load route by id and append to req.
 */
function load(req, res, next, id) {
  Route.get(id)
    .then((route) => {
      req.route = route; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get route
 * @returns {Route}
 */
function get(req, res) {
  return res.json(req.route.publicInfo);
}

/**
 * Create new route
 * @property {string} req.body.name - The name of route.
 * @property {string} req.body.color - The color of route.
 * @property {[string]} req.body.destinationId - The destination point of route.
 * @property {[string]} req.body.originId - The origin point of route.
 * @property {[string]} req.body.wayPoints - The array of all stops of route
 * @returns {Route}
 */
function create(req, res, next) {
  // check is route alredy exist
  return Route.findOne({ name: req.body.name })
    .exec()
    .then((result) => {
      // create new route and save him
      if (result === null) {
        const route = new Route({
          name: req.body.name,
          color: req.body.color,
          destinationId: req.body.destinationId,
          originId: req.body.originId,
          wayPoints: req.body.wayPoints
        });
        return route.save();
      }
      throw new APIError('Route with the same name is already exist', httpStatus.BAD_REQUEST);
    })
    .then(savedRoute => res.json({
      route: savedRoute.publicInfo()
    }))
    .catch(e => next(e));
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
    .then(users => res.json(users))
    .catch(e => next(e));
}

module.exports = {
  load,
  get,
  create,
  list
};
