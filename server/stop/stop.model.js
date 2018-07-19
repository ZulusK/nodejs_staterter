const mongoose = require('mongoose');
require('mongoose-geojson-schema');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
const mongoosePaginate = require('mongoose-paginate');
const privatePaths = require('mongoose-private-paths');

/**
 * @swagger
 * definitions:
 *  Stop:
 *    summary: Defines public stop model
 *    type: object
 *    properties:
 *      name:
 *        type: string
 *        example: "Tan Tye Place"
 *      _id:
 *        type: string
 *        format: byte
 *        example: 507f1f77bcf86cd799439443
 *      location:
 *        $ref: "#/definitions/Point"
 *      address:
 *        type: string
 *        example: "MRT"
 */
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
