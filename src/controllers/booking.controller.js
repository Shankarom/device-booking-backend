const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { bookingService } = require('../services');

const getBookings = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name', 'role']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const { search } = pick(req.query, ['search']);
console.log(req.user)
    options.populate = 'requestedBy,license,company,device'
    req.query.status ? (filter.bookingStatus = req.query.status) : filter
    const result = await bookingService.requests(filter, options, search);
    const extractedData = result.results.map(item => {
        return {
            companyName: item?.company?.companyName,
            licenseName: item?.license?.name,
            userFirstName: item?.requestedBy?.firstName,
            userLastName: item?.requestedBy?.lastName,
            userEmail: item?.requestedBy?.email,
            deviceName: item?.device?.name,
            bookingStatus: item?.bookingStatus,
            createdAt: item?.createdAt,
            updatedAt: item?.updatedAt
        };
    });
    result.results = extractedData
    return res.status(200).json({
        message: "Devices request list", success: true, result
    });
});

module.exports = {
    getBookings
}