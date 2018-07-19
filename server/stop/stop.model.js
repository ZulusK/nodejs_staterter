const mongoose = require('mongoose');
require('mongoose-geojson-schema');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
const mongoosePaginate = require('mongoose-paginate');
const privatePaths = require('mongoose-private-paths');

const StopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  location: {
    type: mongoose.Schema.Types.Point,
    required: true
  },
  address: {
    type: String,
    required: true
  }
});

StopSchema.index({ name: 1, location: '2dsphere' });

/**
 * Statics
 */
StopSchema.statics = {
  /**
   * Get entity by it's id
   * @param {ObjectId} id - The objectId of entity.
   * @returns {Promise<Stop, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((route) => {
        if (route) {
          return route;
        }
        const err = new APIError('No such stop exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List entities in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of entities to be skipped.
   * @param {number} limit - Limit number of entities to be returned.
   * @returns {Promise<Stop[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.paginate(
      {},
      {
        sort: { name: -1 },
        limit: +limit,
        offset: +skip
      }
    );
  }
};
StopSchema.plugin(mongoosePaginate);
StopSchema.plugin(privatePaths);

/**
 * @typedef Stop
 */
module.exports = mongoose.model('Stop', StopSchema);
