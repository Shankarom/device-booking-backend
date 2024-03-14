const httpStatus = require('http-status');
const pick = require('../utils/pick');
const { userType, bookingStatus } = require('../config/roles');
const catchAsync = require('../utils/catchAsync');
const {Device, User, Request} = require('../models/index');
const dashboardService = require('../services/dashboard.service')

const dashboardDetails = catchAsync(async (req, res) => {
    // const filter = pick(req.query, ['firstName', 'lastName', 'email']);
    // const options = pick(req.query, ['sortBy', 'limit', 'page']);
    // const { search } = pick(req.query, ['search']);
    // const result = await companyService.queryCompanies(filter, options, search);
    let result = {}
    const getActiveDevices = await Device.countDocuments({isDeleted: false});
    const getTotalDevices = await Device.countDocuments();
    const getActiveUsers = await User.countDocuments({isDeleted: false, userType: userType.USER});
    const getActiveManagers = await User.countDocuments({isDeleted: false, userType: userType.MANAGER});
    const getMobileDeviceType = await Device.countDocuments({deviceType:'mobile'});
    const getLaptopDeviceType = await Device.countDocuments({deviceType:'laptop'});
    const getDesktopDeviceType = await Device.countDocuments({deviceType:'desktop'});
    const getTabletDeviceType = await Device.countDocuments({deviceType:'tablet'});
    const getPendingRequest = await Request.countDocuments({bookingStatus: bookingStatus.PENDING});
    const getTotalBookings = await Request.countDocuments({bookingStatus: bookingStatus.APPROVED});
    const data = await dashboardService.getUserBookingDevice();
    let device = {
        activeDevices: getActiveDevices,
        totalDevices: getTotalDevices
    }
    let deviceType = {
        mobile: getMobileDeviceType,
        laptop: getLaptopDeviceType,
        desktop: getDesktopDeviceType,
        tablet: getTabletDeviceType
    }
    result.device = device
    result.deviceType = deviceType
    result.activeUsers = getActiveUsers
    result.activeManagers = getActiveManagers
    result.totalPendingRequest = getPendingRequest
    result.totalBookings = getTotalBookings
    result.bookingDetails = data
    
    return res.status(200).json({
        message: "Dashboard Data", success: true, result
    });
});

const getDevicesBookedDetails = catchAsync(async(req, res) => {
        const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const { search } = pick(req.query, ['search']);
    const data = await dashboardService.getUserBookingDevice(options, search);
    return res.status(200).json({
        message: "Dashboard Data", success: true, data
    });
})

module.exports = {
    dashboardDetails,
    getDevicesBookedDetails
}

