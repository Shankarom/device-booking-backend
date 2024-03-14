const httpStatus = require('http-status');
const { Booking } = require('../models');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');

/**
 * Get booking for dashboard
 * @returns {Promise<Company>}
 */
const getUserBookingDevice = async () => {
  
    const bookings = await Booking.aggregate([
        { $unwind: "$bookedBy" },
        // Lookup to get user details for each bookedBy ID
        {
          $lookup: {
            from: "users",
            localField: "bookedBy",
            foreignField: "_id",
            as: "userDetails"
          }
        },
        // // Unwind the userDetails array
        { $unwind: "$userDetails" },
        // // Sort by the createdAt field in descending order to get the most recent bookings first
        { $sort: { createdAt: -1 } },
        // // // Group by device to get an array of users who booked each device
        {
          $group: {
              _id: "$deviceId", // Group by device
              bookings: {
                  $push: {
                      userDetails: {
                          firstName: "$userDetails.firstName",
                          lastName: "$userDetails.lastName",
                          email: "$userDetails.email"
                      },
                      startTime: "$startTime",
                      endTime: "$endTime"
                  }
              }
          }
      },
        // // Lookup to get device details for each device ID
        {
          $lookup: {
            from: "devices",
            localField: "_id",
            foreignField: "_id",
            as: "deviceDetails"
          }
        },
        // // Unwind the deviceDetails array
        { $unwind: "$deviceDetails" },
        // Project to reshape the output document
        {
          $project: {
            _id: 1,
            deviceName: "$deviceDetails.name",
            bookings: 1,
            // type: "$deviceDetails.type",
            // users: {
            //     $map: {
            //       input: "$users",
            //       as: "user",
            //       in: {
            //         firstName: "$$user.firstName",
            //         lastName: "$$user.lastName",
            //         email: "$$user.email"
            //       }
            //     }
            //   }
          }
        },
    ]); 
    return bookings;
  };

  module.exports = {getUserBookingDevice};