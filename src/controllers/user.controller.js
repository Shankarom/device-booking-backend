const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, companyService, deviceService, emailService } = require('../services');
const {userType} = require('../config/roles');
const {Company} = require('../models/index')
const createUser = catchAsync(async (req, res) => {
  Object.assign(req.body, { authType: 'email' });
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

async function createAdminUser(next) {
  try {
    const obj = {
      firstName: 'super',
      lastName: 'admin',
      email: 'admin@booking.com', 
      password: 'admin@123',
      userType: userType.SUPERADMIN,
      status:true,
      authType: 'email',
      role: 'superadmin'
    }
    const user = await userService.createUser(obj);
    return user;
  } catch (error) {
    console.error('Error creating admin user:', error);
    next(error)
  }
}

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const { search } = pick(req.query, ['search']);
  // const condition = {
  //   isDeleted: fasl
    options.populate = 'company'
  filter.userType = 'user'
  const result = await userService.queryUsers(filter, options, search);
  const extractedData = result.results.map(item => {
    return {
        companyName: item?.company?.companyName,
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
    };
});
result.results = extractedData
  return res.status(200).json({
    message:"Users list",success: true, result
});
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const createRequest = catchAsync(async (req, res) => {
  const deviceDetails = await deviceService.getDeviceDetails(req.body.device,req.user._id)
  // if(deviceDetails[0].manager === null) {

  // }
  const checkUserComapny = await companyService.getCompanyId({user: req.user._id})
  const ifCompanyUserBooking = await userService.deviceAvailability(checkUserComapny._id,req.body.device,req.body.bookingDate,req.body.startTime,req.body.endTime);
  Object.assign(req.body, { requestedBy: req.user._id , license: checkUserComapny.licenseId, company: checkUserComapny._id, requestedTo: deviceDetails[0].manager._id, userDeviceUsageRemaingCount:checkUserComapny?.licenseId?.maxUsers});
  const create = await userService.createRequest(req.body)
  if(ifCompanyUserBooking) {
    // if(ifCompanyUserBooking.userDeviceUsageRemaingCount)
    await emailService.sendEmail(deviceDetails[0].manager.email, 'Request for device allotment approval',`approval for ${deviceDetails[0].name} from ${req.user.firstName}`);
    return res.status(httpStatus.CREATED).json({
      message: "Request already is there for the device for this company", success: true
  });
  } else {
    return res.status(httpStatus.CREATED).json({
      message: "Request is created for the device for this company", success: true, create
  });
  }
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  createAdminUser,
  createRequest
};
