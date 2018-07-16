const mongoose = require('mongoose');
require('mongoose-geojson-schema');
const httpStatus = require('http-status');
const APIError = require('@helpers/APIError');
// const config = require('@config/config');
const gmAPI = require('@server/mapsAPI');

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

EventSchema.index({ location: '2dsphere' });

EventSchema.pre('save', function preSave(next) {
  if (this.isNew || this.isModified('address')) {
    this.location = gmAPI.decodeAddress(this.address);
  }
  next();
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
