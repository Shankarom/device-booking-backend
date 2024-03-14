const httpStatus = require('http-status');
const { License } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a license
 * @param {Object} licenseBody
 * @returns {Promise<License>}
 */
const createLicense = async (licenseBody) => {
    return License.create(licenseBody);
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getLicenseById = async (id) => {
    return License.findById(id);
};

/**
 * Get license
 * @returns {Promise<License>}
 */
const getLicense = async () => {
    return License.find({isDeleted: false}).sort({createdAt:-1});
};

/**
 * Update license by id
 * @param {ObjectId} licenseId
 * @param {Object} updateBody
 * @returns {Promise<License>}
 */
const updateLicenseById = async (licenseId, updateBody) => {
    const license = await getLicenseById(licenseId);
    if (!license) {
      throw new ApiError(httpStatus.NOT_FOUND, 'License not found');
    }
    Object.assign(license, updateBody);
    await license.save();
    return license;
};

/**
 * Delete license by id
 * @param {ObjectId} licenseId
 * @returns {Promise<License>}
 */
const deleteLicenseById = async (licenseId) => {
    const license = await getLicenseById(licenseId);
    if (!license) {
      throw new ApiError(httpStatus.NOT_FOUND, 'License not found');
    }
    await License.updateOne({_id:licenseId},{isDeleted: true});
    return license;
};

module.exports = {
    createLicense,
    getLicense,
    updateLicenseById,
    deleteLicenseById,
    getLicenseById
}