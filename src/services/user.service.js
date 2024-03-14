const httpStatus = require('http-status');
const { User, Company, Request, Booking } = require('../models');
const ApiError = require('../utils/ApiError');
const { userType } = require('../config/roles')
const mongoose = require('mongoose');
/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (userBody.userType === userType.USER || userBody.userType === userType.MANAGER) {
    if (await User.isEmailTaken(userBody.email)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
  } else if (userBody.userType === userType.SUPERADMIN) {
    if (await User.isEmailTaken(userBody.email)) {
      return
    }
  }

  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} search - Text string to search in search fields
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options, search, condition) => {
  const users = await User.paginate(filter, options, search, condition);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getDeviceManager = async (condition) => {
  return User.findOne(condition);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email, db) => {
  if (db === 'Company') {
    return Company.findOne({ email });
  } else if (db === 'User') {
    return User.findOne({ email });
  }

};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  // await user.deleteOne();
  await User.updateOne({ _id: userId }, { isDeleted: true });
  return user;
};

/**
 * Get manager's devices
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const getManagerAssignedDevices = async (userId, options, search) => {

  const pipeline = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $lookup: {
        from: 'devices',
        localField: 'deviceId',
        foreignField: '_id',
        as: 'devices'
      }
    },
    {
      $unwind: {
        path: '$devices'
      }
    },
    {
      $match: {
        'devices.isDeleted': false
      }
    }
  ];

  // Conditionally apply the $match stage for searching by name
  if (search && typeof search === 'string' && search.trim() !== '') {
    pipeline.push({
      $match: {
        'devices.name': { $regex: search, $options: 'i' }
      }
    });
  }

  pipeline.push({
    $project: {
      devices: 1,
      _id: 0
    }
  });

  const devices = await User.aggregateWithPagination(pipeline, options);

  return devices;
};

/**
 * Check for device availability
 * @param {Object} filter - Mongo filter
 * @returns {Promise<Request>}
 */
const deviceAvailability = async (companyId, deviceId, date, startTime, endTime) => {
  const existingBooking = await Request.findOne({
    device: deviceId,
    company: companyId,
    bookingDate: date,
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      },
      {
        startTime: { $gte: startTime, $lte: endTime }
      }
    ]
  });
  return existingBooking;
};

/**
 * Create a request
 * @param {Object} requestBody
 * @returns {Promise<User>}
 */
const createRequest = async (requestBody) => {
  return Request.create(requestBody);
};

/**
 * Get approval list
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const approvalList = async (condition) => {
  var populateQuery = [{ path: 'device', select: 'name' }, { path: 'requestedBy', select: 'firstName lastName' }];
  return Request.find(condition).sort({ createdAt: -1 }).populate(populateQuery);
};

/**
 * Get request by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getRequestById = async (id) => {
  return Request.findById(id);
};

/**
 * Update request by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const updateRequest = async (requestId, status, managerId) => {
  const request = await getRequestById(requestId);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  // await user.deleteOne();
  await Request.updateOne({ _id: requestId }, { bookingStatus: status, markedBy: managerId });
  return request;
};

/**
 * Create a booking
 * @param {Object} requestBody
 * @returns {Promise<User>}
 */
const createBooking = async (requestBody) => {
  return Booking.create(requestBody);
};

/**
 * Create a booking
 * @param {Object} requestBody
 * @returns {Promise<User>}
 */
const checkMaxUserLimit = async (requestId) => {
  const request = await getRequestById(requestId);
  const { bookingDate, startTime, endTime, device } = request;
  const existingBookingsCount = await Request.findOne({
    device: device,
    bookingDate: bookingDate,
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      },
      {
        startTime: { $gte: startTime, $lte: endTime }
      }
    ]
  });
  return existingBookingsCount;
}

/**
 * Get booking by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getBooking = async (condition) => {
  return Booking.findOne(condition);
};
// /
// * Update booking by id
// * @param {ObjectId} companyId
// * @param {Object} updateBody
// * @returns {Promise<Company>}
// */
const updateBokingById = async (bookingId, updateBody) => {
  const booking = await getBooking(bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  await Booking.findOneAndUpdate(
    { request: new mongoose.Types.ObjectId(bookingId.request) },
    {
      $push: { bookedBy: new mongoose.Types.ObjectId(updateBody.bookedBy) },
      $set: { userDeviceUsageRemaingCount: updateBody.userDeviceUsageRemaingCount }
    },
    { new: true }
  );
  return booking;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  getManagerAssignedDevices,
  deviceAvailability,
  approvalList,
  createRequest,
  getDeviceManager,
  getRequestById,
  updateRequest,
  createBooking,
  checkMaxUserLimit,
  getBooking,
  updateBokingById
};
