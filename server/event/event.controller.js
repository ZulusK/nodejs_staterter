const Event = require('./event.model');
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
  return Event.get(id)
    .then((event) => {
      req.$event = event; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(next);
}

function get(req, res) {
  return res.json(req.$event.toJSON());
}

function create() {
  throw new APIError(httpStatus.NOT_IMPLEMENTED, null, true);
}

function list(req, res, next) {
  const { limit = 50, skip = 0, populate = false } = req.query;
  Event.list({ limit, skip, populate })
    .then(result => res.json({
      ...result,
      docs: result.docs.map(e => e.toJSON())
    }))
    .catch(next);
}

function remove(req, res, next) {
  req.$event
    .remove()
    .then(removedEvent => res.json(removedEvent.publicInfo()))
    .catch(next);
}

module.exports = {
  load,
  get,
  create,
  remove,
  list
};
