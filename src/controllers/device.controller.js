const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { deviceService, userService } = require('../services');
const {User} = require('../models/index')

const createDevice = catchAsync(async (req, res) => {
    const device = await deviceService.createDevice(req.body);
    return res.status(200).json({
        message:"Device added successfully",success: true, device
    });
    // res.status(httpStatus.CREATED).send({message: "Device added successfully", data:{device}});
});

const getDevices = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const { search } = pick(req.query, ['search']);
    filter.isDeleted = false
    const result = await deviceService.queryDevices(filter, options, search);
    return res.status(200).json({
        message:"Devices list",success: true, result
    });
    // res.send({message:"Devices list",success: true, result}).status(httpStatus.CREATED);
});

const getDevice = catchAsync(async (req, res) => {
    const device = await deviceService.getDeviceById(req.params.deviceId);
    if (!device) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
    }
    return res.status(200).json({
        message:"Device details",success: true, device
    });
});

const updateDevice = catchAsync(async (req, res) => {
    const device = await deviceService.updateDeviceById(req.params.deviceId, req.body);
    return res.status(200).json({
        message:"Devices updated successfully",success: true, device
    });
});

const deleteDevice = catchAsync(async (req, res) => {
    const deleteDevice = await deviceService.deleteDeviceById(req.params.deviceId);
    if(deleteDevice) {
            await User.updateMany(
            // Filter condition: Update documents where the deviceId exists in the device array
            { deviceId: req.params.deviceId },
            // Update operation: Remove the deviceId from the device array
            { $pull: { deviceId: req.params.deviceId } }
          );
    }
    // res.status(httpStatus.CREATED).send({message:"Device Deleted successfully"});
    return res.status(200).json({
        message:"Devices deleted successfully",success: true
    });
});

module.exports = {
    createDevice,
    getDevices,
    getDevice,
    updateDevice,
    deleteDevice
}