const mongoose = require('mongoose');
require('mongoose-geojson-schema');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
const mongoosePaginate = require('mongoose-paginate');
// const config = require('@config/config');

const BusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    default: null
  },
  seatsCount: {
    type: Number,
    required: true
  },
  number: {
    type: String,
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  location: {
    type: mongoose.Schema.Types.Point
  }
});

BusSchema.index({ location: '2dsphere' });
BusSchema.set('toJSON', { virtual: true });

/**
 * Statics
 */
BusSchema.statics = {
  get(id) {
    return this.findById(id)
      .populate('driver')
      .populate('route')
      .exec()
      .then((bus) => {
        if (bus) {
          return bus;
        }
        const err = new APIError('No such bus exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  listByRoute(route, { skip = 0, limit = 50, populate = false } = {}) {
    return this.paginate(
      { route },
      {
        sort: { name: -1 },
        limit: +limit,
        offset: +skip,
        populate: populate ? ['driver', 'route'] : undefined
      }
    );
  },

  list({ skip = 0, limit = 50, populate = false } = {}) {
    return this.paginate(
      {},
      {
        sort: { name: -1 },
        limit: +limit,
        offset: +skip,
        populate: populate ? ['driver', 'route'] : undefined
      }
    );
  }
};

BusSchema.plugin(mongoosePaginate);

/**
 * @typedef Bus
 */
module.exports = mongoose.model('Bus', BusSchema);
