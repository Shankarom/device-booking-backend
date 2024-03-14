const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { bookingService } = require('../services');

const getBookings = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name', 'role']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const { search } = pick(req.query, ['search']);
    // const condition = {
    //   isDeleted: fasl
    // }
//     if(req.query.status === 'approve'){
//     options.populate = 'bookedBy'
//     const result = await bookingService.bookings(filter, options, search);
//     return res.status(200).json({
//         message:"Devices list",success: true, result
//     });
// } 
    options.populate = 'requestedBy'
    req.query.status? (filter.bookingStatus =req.query.status) : filter
    const result = await bookingService.requests(filter, options, search);
    return res.status(200).json({
        message:"Devices request list",success: true, result
    });

});

module.exports = {
    getBookings
}