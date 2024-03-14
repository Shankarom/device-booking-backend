const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate, aggregate } = require('./plugins');
const authTypes = require('../config/authTypes');
const { roles } = require('../config/roles');

const companySchema = mongoose.Schema(
  {
    companyName: {
      type: String,
      // required: true,
      trim: true,
    },
    companyType: {
      type: String,
      // required: true,
      // trim: true,
    },
    website: {
      type: String,
      // required: true,
      trim: true,
    },
    companyHead: {
      type: String,
      // required: true,
      trim: true,
    },
    address: {
      type: String,
      // required: true,
      trim: true,
    },
    companyLogo: {
      type: String,
      // required: true,
      trim: true,
    },
    industry: {
      type: String,
      // required: true,
      trim: true,
    },
    founded: {
      type: String,
      // required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      // required: true, TODO: do we need this?
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    authType: {
      type: String,
      // required: true,
      enum: authTypes,
      private: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    user: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    }],
    licenseId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'License'
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    currentUserCountRemainig: {
      type: Number
    },
    userType: {
      type: String,
      default: 'company'
    },
    role: {
      type: String,
      enum: roles,
      default: 'company',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
companySchema.plugin(toJSON);
companySchema.plugin(paginate);
companySchema.plugin(aggregate);

/**
 * Return paths to text search in paginate plugin
 * @returns {Array<string>}
 */
companySchema.statics.searchableFields = function () {
  return ['companyName', 'email'];
};

/**
 * Check if email is taken
 * @param {string} email - The company's email
 * @param {ObjectId} [excludeCompanyrId] - The id of the company to be excluded
 * @returns {Promise<boolean>}
 */
companySchema.statics.isEmailTaken = async function (email, excludeCompanyrId) {
  const company = await this.findOne({ email, _id: { $ne: excludeCompanyrId } });
  return !!company;
};

/**
 * Check if password matches the company's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
companySchema.methods.isPasswordMatch = async function (password) {
  const company = this;
  return bcrypt.compare(password, company.password);
};

companySchema.pre('save', async function (next) {
  const company = this;
  if (company.isModified('password')) {
    company.password = await bcrypt.hash(company.password, 8);
  }
  next();
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
