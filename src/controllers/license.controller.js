const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { licenseService } = require('../services');

const createLicense = catchAsync(async (req, res) => {
    const license = await licenseService.createLicense(req.body);
    return res.status(httpStatus.CREATED).json({
        message:"License added successfully",success: true, license
    });
});

const getLicense = catchAsync(async (req, res) => {
    const result = await licenseService.getLicense();
    return res.status(200).json({
        message:"License list",success: true, result
    });
});

const updateLicense = catchAsync(async (req, res) => {
    const license = await licenseService.updateLicenseById(req.params.licenseId, req.body);
    return res.status(200).json({
        message:"License updated successfully",success: true, license
    });
});

const deleteLicense = catchAsync(async (req, res) => {
    await licenseService.deleteLicenseById(req.params.licenseId);
    return res.status(200).json({
        message:"License deleted successfully",success: true
    });
});

module.exports = {
    createLicense,
    getLicense,
    updateLicense,
    deleteLicense
}