const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
const Bus = require('@server/bus/bus.model');
// const config = require('@config/config');

/**
 * @swagger
 * definitions:
 *  Route:
 *    summary: Defines short public route model
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *        format: byte
 *        example: 507f1f77bcf86cd799439011
 *      name:
 *        type: string
 *        example: "West Route"
 *      origin:
 *        description: Id of Stop, used as origin of route
 *        type: string
 *        format: byte
 *        example: 507f1f77bcf86cd799439011
 *      destination:
 *        description: Id of Stop, used as destination of route
 *        type: string
 *        format: byte
 *        example: 507f1f77bcf86cd799439011
 *      color:
 *        type: string
 *        example: "#ff12ad"
 *      distance:
 *        type: string
 *        example: "12 km"
 *      estimatedTime:
 *        type: string
 *        example: "1h 30m"
 *      waypoints:
 *        type: array
 *        items:
 *          type: string
 *          format: byte
 *          example: 507f1f77bcf86cd799439011
 *  Route-full:
 *    summary: Defines full public route model
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *        format: byte
 *        example: 507f1f77bcf86cd799439011
 *      name:
 *        type: string
 *        example: "West Route"
 *      origin:
 *        $ref: "#/definitions/Stop"
 *      destination:
 *        $ref: "#/definitions/Stop"
 *      color:
 *        type: string
 *        example: "#ff12ad"
 *      distance:
 *        type: string
 *        example: "12 km"
 *      estimatedTime:
 *        type: string
 *        example: "1h 30m"
 *      waypoints:
 *        type: array
 *        items:
 *          $ref: "#/definitions/Stop"
 */
const RouteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  origin: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Stop'
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Stop'
  },
  color: {
    type: String,
    default: '#42a5f5'
  },
  distance: {
    type: String,
    required: true
  },
  estimatedTime: {
    type: String,
    required: true
  },
  waypoints: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stop',
        required: true
      }
    ],
    required: true
  }
});

RouteSchema.index({ name: 1 });
RouteSchema.set('toJSON', { virtual: true });

/**
 * @returns {Promise(Bus[])} returns busses, asssociated with this route
 */
RouteSchema.virtual('busses').get(function getBusses() {
  return Bus.find({ routeId: this._id }).exec();
});

/**
 * Statics
 */
RouteSchema.statics = {
  /**
   * Get entity by it's id
   * @param {ObjectId} id - The objectId of entity.
   * @returns {Promise<Route, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('destination')
      .populate('origin')
      .populate('waypoints')
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
 * @typedef Route
 */
module.exports = mongoose.model('Route', RouteSchema);
