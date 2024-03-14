const mongoose = require('mongoose');
const { toJSON, paginate, aggregate } = require('./plugins');
const { bookingStatus } = require('../config/roles');

const bookingSchema = mongoose.Schema(
  {
    request: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Request'
    },
    bookedBy: [{
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User'
    }],
    startTime: {
      type: Date
    },
    endTime: {
      type: Date
    },
    bookingDate: {
      type: Date
    },
    userDeviceUsageRemaingCount: {
      type: Number,
      default: 1
    },
    deviceId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Device'
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
bookingSchema.plugin(toJSON);
bookingSchema.plugin(paginate);
bookingSchema.plugin(aggregate);

/**
 * Return paths to text search in paginate plugin
 * @returns {Array<string>}
 */
bookingSchema.statics.searchableFields = function () {
  return ['bookedBy'];
};
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
