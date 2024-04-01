const mongoose = require('mongoose');
const { toJSON,paginate } = require('./plugins');

const deviceSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    deviceType: {
      type: String
    },
    description: {
      type: String
    },
    purpose: {
      type: String
    },
    price: {
      type: String
    },
    runningDuration: {
      type: String
    },
    location: {
      type: String
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
deviceSchema.plugin(toJSON);
deviceSchema.plugin(paginate);

deviceSchema.statics.searchableFields = function () {
  return ['name','deviceType'];
};
const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
