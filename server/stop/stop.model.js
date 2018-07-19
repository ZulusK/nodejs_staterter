const mongoose = require('mongoose');
require('mongoose-geojson-schema');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
const mongoosePaginate = require('mongoose-paginate');

const StopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  location: {
    private: true,
    type: mongoose.Schema.Types.Point,
    required: true
  },
  address: {
    type: String,
    required: true
  }
});

StopSchema.index({ name: 1, location: '2dsphere' });
StopSchema.set('toJSON', { virtuals: true });

StopSchema.virtual('coordinates').get(function getCoordinates() {
  return {
    longitude: this.location.coordinates[0],
    latitude: this.location.coordinates[1]
  };
});

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
        sort: { createdAt: -1 },
        limit: +limit,
        offset: +skip
      }
    );
  }
};
StopSchema.plugin(mongoosePaginate);
/**
 * @typedef Stop
 */
module.exports = mongoose.model('Stop', StopSchema);
