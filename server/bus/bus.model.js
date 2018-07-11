const mongoose = require('mongoose');
require('mongoose-geojson-schema');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
// const config = require('@config/config');

/**
 * @swagger
 *  definitions:
 *      Bus:
 *        description: Bus public model
 *        type: object
 *        properties:
 *          id:
 *              type: string
 *              format: byte
 *              example: 507f1f77bcf86cd799439011
 *          name:
 *              type: string
 *          seats:
 *              type: array
 *              items:
 *                  $ref: "#/definitions/Seat"
 *          seatsCount:
 *              type: integer
 *              format: int32
 *              description: Maximum count of seats in a bus
 *          driverId:
 *              type: string
 *              format: byte
 *              example: 507f1f77bcf86cd799439011
 *          routeId:
 *              type: string
 *              format: byte
 *              example: 507f1f77bcf86cd799439011
 *          location:
 *              $ref: "#/definitions/Point"
 *          updatedAt:
 *              type: integer
 *              format: int64
 *          createdAt:
 *              type: integer
 *              format: int64
 */

const BusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    routeId: {
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
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    location: {
      type: mongoose.Schema.Types.Point
    }
  },
  { timestamps: true }
);

BusSchema.index({ location: '2dsphere' });

/**
 * Statics
 */
BusSchema.statics = {
  /**
   * Get user
   * @param {ObjectId} id - The objectId of bus.
   * @returns {Promise<Bus, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('No such bus exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List bus in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of buses to be skipped.
   * @param {number} limit - Limit number of buses to be returned.
   * @returns {Promise<Bus[]>}
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
