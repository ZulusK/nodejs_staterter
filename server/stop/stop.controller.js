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
      req.$stop = stop;
      return next();
    })
    .catch(next);
}

function get(req, res) {
  return res.json(req.$stop.toJSON());
}

function create() {
  throw new APIError(httpStatus.NOT_IMPLEMENTED, null, true);
}

function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  return Stop.list({ limit, skip })
    .then(result => res.json({
      ...result,
      docs: result.docs.map(e => e.toJSON())
    }))
    .catch((err) => {
      console.log(err);
      next();
    });
}

function remove(req, res, next) {
  req.$stop
    .remove()
    .then(removedStop => res.json(removedStop.toJSON()))
    .catch(next);
}

module.exports = {
  load,
  get,
  create,
  remove,
  list
};
