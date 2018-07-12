const Stop = require('./stop.model');
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
  return Stop.get(id)
    .then((stop) => {
      req.$stop = stop; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(next);
}

function get(req, res) {
  return res.json(req.$stop);
}

function create() {
  throw new APIError(httpStatus.NOT_IMPLEMENTED, null, true);
}

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
