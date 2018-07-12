const mongoose = require('mongoose');
require('mongoose-geojson-schema');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
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
  seats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seat'
    }
  ],
  seatsCount: {
    type: Number,
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
  /**
   * Get entity by it's id
   * @param {ObjectId} id - The objectId of entity.
   * @returns {Promise<Route, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('driver')
      .populate('route')
      .exec()
      .then((route) => {
        if (route) {
          return route;
        }
        const err = new APIError('No such bus exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List entities in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of entities to be skipped.
   * @param {number} limit - Limit number of entities to be returned.
   * @returns {Promise<route[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

/**
 * @typedef Bus
 */
module.exports = mongoose.model('Bus', BusSchema);
