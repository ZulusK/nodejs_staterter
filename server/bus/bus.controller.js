const Bus = require('./bus.model');
const { ObjectId } = require('mongoose').Types;
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');

// const config = require('@config/config');

function load(req, res, next, id) {
  if (!ObjectId.isValid(id)) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: 'Parameter id is not a valid object id' });
  }
  return Bus.get(id)
    .then((bus) => {
      req.$bus = bus; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(next);
}

function get(req, res) {
  return res.json(req.$bus.toJSON());
}

function create() {
  throw new APIError(httpStatus.NOT_IMPLEMENTED, null, true);
}

function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Bus.list({ limit, skip })
    .then(docs => res.json(docs.map(d => d.toJSON())))
    .catch(next);
}

function remove(req, res, next) {
  req.$bus
    .remove()
    .then(removedBus => res.json(removedBus.toJSON()))
    .catch(next);
}

function listByRoute(req, res, next) {
  Bus.find({ route: req.$route._id })
    .exec()
    .then(busesOnRoute => res.json(busesOnRoute.map(b => b.toJSON())))
    .catch(next);
}

module.exports = {
  load,
  get,
  create,
  remove,
  list,
  listByRoute
};
