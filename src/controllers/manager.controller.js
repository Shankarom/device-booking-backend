const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const {
    userService,
    emailService, licenseService
} = require('../services');
const { userType, bookingStatus } = require('../config/roles');
const { generatePassword } = require('../utils/password');

const createManager = catchAsync(async (req, res) => {
    const createPassword = generatePassword()
    Object.assign(req.body, { authType: 'email', userpassword: createPassword, userType: userType.MANAGER, role: 'manager' });
    const manager = await userService.createUser(req.body);
    if (manager) {
        await emailService.sendEmail(req.body.email, 'Login credential', createPassword);
        // res.status(httpStatus.CREATED).send({ message: "Manager added successfully", manager });
        return res.status(200).json({
            message: "Manager added successfully", success: true, manager
        });
    }
});

const getManagers = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['firstName', 'lastName']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    options.populate = 'deviceId'
    const { search } = pick(req.query, ['search']);
    // const condition = {
    //   isDeleted: fasl
    // }
    const condition = {
        userType: userType.MANAGER
    }
    const result = await userService.queryUsers(filter, options, search, condition);
    return res.status(200).json({
        message: "Manager List", success: true, result
    });
});

const getManager = catchAsync(async (req, res) => {
    const manager = await userService.getUserById(req.params.managerId);
    if (!manager) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Manager not found');
    }
    // res.send(manager);
    return res.status(200).json({
        message: "Manager details", success: true, manager
    });
});

const updateManager = catchAsync(async (req, res) => {
    const manager = await userService.updateUserById(req.params.managerId, req.body);
    return res.status(200).json({
        message: "Manager updated successfully", success: true, manager
    });
});

const deleteManager = catchAsync(async (req, res) => {
    await userService.deleteUserById(req.params.managerId);
    // res.status(httpStatus.CREATED).send({ message: "Manager Deleted successfully" });
    return res.status(200).json({
        message: "Manager deleted successfully", success: true
    });
});

const getManagerAssignedDevices = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const { search } = pick(req.query, ['search']);

    const result = await userService.getManagerAssignedDevices(req.params.managerId, options, search);
    const finalData = result.data
    const pageDetails = {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        totalResults: result.totalResults
    }
    const results = finalData.map(item => item.devices);
    return res.status(200).json({
        success: true,
        message: "Devices list",
        result: {results, pageDetails}
    });
});

const managerRequestList = catchAsync(async (req, res) => {
    const data = await userService.approvalList({ requestedTo: req.user._id, bookingStatus: bookingStatus.PENDING })
    return res.status(200).json({
        success: true,
        message: "Approval List",
        data
    });
});

const approvingRequest = catchAsync(async (req, res) => {
    const getRequestData = await userService.getRequestById(req.params.requestId);
    const license = await licenseService.getLicenseById(getRequestData.license);
    const maxUserLimit = license.maxUsers;
    const updateRequest = await userService.updateRequest(req.params.requestId, req.body.status, req.user._id);
    const checkUserDeviceUsage = await userService.checkMaxUserLimit(req.params.requestId);
    const bookingDetail = await userService.getBooking({ request: checkUserDeviceUsage._id });

    if(req.body.status === bookingStatus.APPROVED) {
        if (checkUserDeviceUsage && (bookingDetail?.userDeviceUsageRemaingCount > maxUserLimit)) {
            return res.status(200).json({
                success: true,
                message: "No more approval can  be accepted"
            });
        }
        if (checkUserDeviceUsage  && bookingDetail) {
            const update = {
                bookedBy: getRequestData.requestedBy,
                userDeviceUsageRemaingCount: bookingDetail?.userDeviceUsageRemaingCount + 1
            }
            const condition = {
                request: checkUserDeviceUsage._id
            }
            await userService.updateBokingById(condition, update)
            return res.status(200).json({
                success: true,
                message: 'Booking confirmed successfully'
            });
        }
        const data = {
            request: req.params.requestId,
            startTime: getRequestData.startTime,
            endTime: getRequestData.endTime,
            bookingDate: getRequestData.bookingDate,
            deviceId: getRequestData.device,
            bookedBy: getRequestData.requestedBy,
        }
        const booking = await userService.createBooking(data);
        return res.status(200).json({
            success: true,
            message: 'Booking confirmed successfully',
            booking
        });
    } else {
        return res.status(200).json({
            success: true,
            message: 'Booking rejected successfully'
        });
    }
})

module.exports = {
    createManager,
    getManagers,
    getManager,
    deleteManager,
    updateManager,
    getManagerAssignedDevices,
    managerRequestList,
    approvingRequest
}