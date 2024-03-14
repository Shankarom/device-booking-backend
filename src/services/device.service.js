const httpStatus = require('http-status');
const { Device } = require('../models');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');

/**
 * Create a device
 * @param {Object} deviceBody
 * @returns {Promise<Device>}
 */
const createDevice = async (deviceBody) => {
    return Device.create(deviceBody);
};

/**
 * Query for Device
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} search - Text string to search in search fields
 * @returns {Promise<QueryResult>}
 */
const queryDevices = async (filter, options, search) => {
    const devices = await Device.paginate(filter, options, search);
    return devices;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getDeviceById = async (id) => {
    return Device.findById(id);
};

/**
 * Update device by id
 * @param {ObjectId} deviceId
 * @param {Object} updateBody
 * @returns {Promise<Device>}
 */
const updateDeviceById = async (deviceId, updateBody) => {
    const device = await getDeviceById(deviceId);
    if (!device) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
    }
    Object.assign(device, updateBody);
    await device.save();
    return device;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteDeviceById = async (deviceId) => {
    const device = await getDeviceById(deviceId);
    if (!device) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
    }
    await Device.updateOne({_id:deviceId},{isDeleted: true});
    return device;
};

const getDeviceDetails = async(deviceId) => {
    const device = await Device.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(deviceId)
            }
        },
        {
            $lookup:{
                from:'users',
                localField:'_id',
                foreignField:'deviceId',
                as:'manager'
            }
        },
        {
            $unwind:{
                path:'$manager'
            }
        }
    ])
    return device;
};

module.exports = {
    createDevice,
    queryDevices,
    getDeviceById,
    updateDeviceById,
    deleteDeviceById,
    getDeviceDetails
}