const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
// const config = require('@config/config');

/**
 * @swagger
 *  definitions:
 *      Route:
 *        description: Route's public model
 *        type: object
 *        properties:
 *          id:
 *              type: string
 *              format: byte
 *              example: 507f1f77bcf86cd799439011
 *          name:
 *              type: string
 *          originId:
 *              $ref: "#/definitions/Point"
 *          destinationId:
 *              $ref: "#/definitions/Point"
 *          distance:
 *              type: integer
 *              format: float
 *          estimatedTime:
 *              type: string
 *              expmaple: '1h 30m'
 *          wayPoints:
 *              type: array
 *              items:
 *                  $ref: "#/definitions/Stop"
 *          color:
 *              type: string
 *              example: "#fff"
 *          updatedAt:
 *              type: integer
 *              format: int64
 *          createdAt:
 *              type: integer
 *              format: int64
 */

const RouteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    originId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Stop'
    },
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Stop'
    },
    color: {
      type: String,
      default: '#42a5f5'
    },
    distance: {
      type: Number,
      required: true
    },
    estimatedTime: {
      type: String,
      required: true
    },
    wayPoints: {
      type: [mongoose.Schema.Types.ObjectId]
    }
  },
  { timestamps: true }
);

RouteSchema.index({ name: 1 });

RouteSchema.method('publicInfo', function publicInfo() {
  const {
    _id: id,
    name,
    distance,
    estimatedTime,
    color,
    destinationId,
    originId,
    wayPoints
  } = this;
  return {
    id,
    name,
    distance,
    estimatedTime,
    color,
    destinationId,
    originId,
    wayPoints
  };
});
/**
 * Statics
 */
RouteSchema.statics = {
  /**
   * Get route by it's id
   * @param {ObjectId} id - The objectId of route.
   * @returns {Promise<route, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((route) => {
        if (route) {
          return route;
        }
        const err = new APIError('No such route exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List route in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of routees to be skipped.
   * @param {number} limit - Limit number of routees to be returned.
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
 * @typedef Route
 */
module.exports = mongoose.model('Route', RouteSchema);
