const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
// const Bus = require('@server/bus/bus.model');
const mongoosePaginate = require('mongoose-paginate');
// const config = require('@config/config');

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

// RouteSchema.virtual('busses').get(function getBusses() {
//   return Bus.find({ routeId: this._id }).exec();
// });

/**
 * Statics
 */
RouteSchema.statics = {
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

  list({ skip = 0, limit = 50, populate = false } = {}) {
    return this.paginate(
      {},
      {
        sort: { name: -1 },
        populate: populate && ['origin', 'destination', 'waypoints'],
        offset: +skip,
        limit: +limit
      }
    );
  }
};

RouteSchema.plugin(mongoosePaginate);

/**
 * @typedef Route
 */
module.exports = mongoose.model('Route', RouteSchema);
