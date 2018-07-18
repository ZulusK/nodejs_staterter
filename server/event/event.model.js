const mongoose = require('mongoose');
require('mongoose-geojson-schema');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
// const config = require('@config/config');
const gmAPI = require('@server/mapsAPI');

/**
 * @swagger
 * definitions:
 *  Event:
 *    summary: Defines short public event model
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *        format: byte
 *        example: 507f1f77bcf86cd799439011
 *      name:
 *        type: string
 *        example: "New year"
 *      text:
 *        type: string
 *        example: "Lorem ipsum..."
 *      address:
 *        type: string
 *        example: "River Valley"
 *      createdAt:
 *        type: string
 *        example: 'Fri Jul 13 2018 02:23:45'
 *        description: Date of event's starts
 *      imageUrl:
 *        type: string
 *        example: 'http://some.utl.com/image.jpeg'
 *      endsAt:
 *        type: string
 *        example: 'Fri Jul 13 2018 02:23:45'
 *        description: Date of event's ends
 *      formattedAddress:
 *        type: string
 *        example: "3 River Valley Rd, Sg 179024"
 *      location:
 *        $ref: "#/definitions/Point"
 *      routes:
 *        type: array
 *        items:
 *          type: string
 *          format: byte
 *          example: 507f1f77bcf86cd799439011
 *  Event-full:
 *    summary: Defines full public event model
 *    type: object
 *    properties:
 *      _id:
 *        type: string
 *        format: byte
 *        example: 507f1f77bcf86cd799439011
 *      name:
 *        type: string
 *        example: "New year"
 *      text:
 *        type: string
 *        example: "Lorem ipsum..."
 *      address:
 *        type: string
 *        example: "River Valley"
 *      createdAt:
 *        type: string
 *        example: 'Fri Jul 13 2018 02:23:45'
 *        description: Date of event's starts
 *      imageUrl:
 *        type: string
 *        example: 'http://some.utl.com/image.jpeg'
 *      endsAt:
 *        type: string
 *        example: 'Fri Jul 13 2018 02:23:45'
 *        description: Date of event's ends
 *      formattedAddress:
 *        type: string
 *        example: "3 River Valley Rd, Sg 179024"
 *      location:
 *        $ref: "#/definitions/Point"
 *      routes:
 *        type: array
 *        items:
 *          $ref: "#/definitions/Route"
 */
const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  routes: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route'
      }
    ],
    default: []
  },
  location: {
    type: mongoose.Schema.Types.Point
  },
  formattedAddress: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true,
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date, default: null },
  imageUrl: {
    required: true,
    type: String,
    trim: true
  }
});

// EventSchema.index({ location: '2dsphere' });

EventSchema.pre('save', function preSave(next) {
  if (this.isNew || this.isModified('address')) {
    return gmAPI.decodeAddress(this.address).then((result) => {
      this.formattedAddress = result.formatted_address;
      this.location = {
        type: 'Point',
        coordinates: [result.geometry.location.lng, result.geometry.location.lat]
      };
      next();
    });
  }
  return next();
});

/**
 * Statics
 */
EventSchema.statics = {
  get(id) {
    return this.findById(id)
      .populate('routes')
      .exec()
      .then((doc) => {
        if (doc) {
          return doc;
        }
        const err = new APIError('No such event exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

/**
 * @typedef Event
 */
module.exports = mongoose.model('Event', EventSchema);
