const mongoose = require('mongoose');
const { toJSON, paginate, aggregate } = require('./plugins');
const { bookingStatus } = require('../config/roles');

const requestSchema = mongoose.Schema(
  {
    requestedBy: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    },
    requestType: {
        type: String
    },
    license: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'License'
    },
    company: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Company'
    },
    markedBy: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    },
    requestedTo: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    },
    device: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Device'
    },
    noOfDevice: {
        type: String
    },
    bookingStatus: {
        type: String,
        enum: [bookingStatus.PENDING, bookingStatus.APPROVED, bookingStatus.REJECTED],
        default: bookingStatus.PENDING
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    bookingDate: {
        type: Date
    },
    requestNumber: {
        type: String
    },
    userDeviceUsageRemaingCount: {
        type: Number
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
requestSchema.plugin(toJSON);
requestSchema.plugin(aggregate);
requestSchema.plugin(paginate);
/**
 * Return paths to text search in paginate plugin
 * @returns {Array<string>}
 */
requestSchema.statics.searchableFields = function () {
    return ['requestedBy', 'bookingStatus'];
  };

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;
