const mongoose = require('mongoose');
require('mongoose-geojson-schema');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
// const config = require('@config/config');

/**
 * @swagger
 *  definitions:
 *      Stop:
 *        description: Bus's stop's public model
 *        type: object
 *        properties:
 *          id:
 *              type: string
 *              format: byte
 *              example: 507f1f77bcf86cd799439011
 *          name:
 *              type: string
 *          location:
 *              $ref: "#/definitions/Point"
 *          updatedAt:
 *              type: integer
 *              format: int64
 *          createdAt:
 *              type: integer
 *              format: int64
 */

const StopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    location: {
      type: mongoose.Schema.Types.Point,
      required: true
    }
  },
  { timestamps: true }
);

StopSchema.index({ name: 1, location: '2dsphere' });

StopSchema.method('publicInfo', function publicInfo() {
  const {
    _id: id,
    name,
    location: {
      coordinates: { 0: longitude, 1: latitude }
    }
  } = this;
  return {
    id,
    name,
    location: {
      longitude,
      latitude
    }
  };
});

/**
 * Statics
 */
StopSchema.statics = {
  /**
   * Get route
   * @param {ObjectId} id - The objectId of stop.
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
   * List stop in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of stopes to be skipped.
   * @param {number} limit - Limit number of stopes to be returned.
   * @returns {Promise<Stop[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec()
      .then(docs => docs.map(d => d.publicInfo()));
  }
};

/**
 * @typedef Stop
 */
module.exports = mongoose.model('Stop', StopSchema);
