const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const licenseSchema = mongoose.Schema(
  {
    name: {
        type: String
    },
    maxUsers: {
        type: Number
    },
    companySize: {
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
licenseSchema.plugin(toJSON);

const License = mongoose.model('License', licenseSchema);

module.exports = License;
