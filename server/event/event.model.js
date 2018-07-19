const mongoose = require('mongoose');
require('mongoose-geojson-schema');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
// const config = require('@config/config');
const gmAPI = require('@/mapsAPI');
const mongoosePaginate = require('mongoose-paginate');

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

EventSchema.index({ name: 1 });

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

  list({ skip = 0, limit = 50, populate = false } = {}) {
    return this.paginate(
      {},
      {
        sort: { name: -1 },
        limit: +limit,
        offset: +skip,
        populate: populate ? ['routes'] : undefined
      }
    );
  }
};
EventSchema.plugin(mongoosePaginate);
/**
 * @typedef Event
 */
module.exports = mongoose.model('Event', EventSchema);
