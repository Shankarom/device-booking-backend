const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const {
    companyService,
    emailService,
    userService,
    licenseService
} = require('../services');
const { userType } = require('../config/roles');
const { generatePassword } = require('../utils/password');

const createCompany = catchAsync(async (req, res) => {
    const checkPlan = await licenseService.getLicenseById(req?.body?.licenseId);
    const companySize = checkPlan?.companySize
    const createPassword = generatePassword()
    Object.assign(req.body, { authType: 'email', password: createPassword, currentUserCountRemainig: Number(companySize) });
    const company = await companyService.createCompany(req.body);
    if (company) {
        await emailService.sendEmail(req.body.email, 'Login credential', createPassword);
        return res.status(httpStatus.CREATED).json({
            message: "Company added successfully", success: true, company
        });
    }
});

const getCompanys = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['companyName', 'email']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const { search } = pick(req.query, ['search']);
    const result = await companyService.queryCompanies(filter, options, search);
    return res.status(200).json({
        message: "Companies list", success: true, result
    });
});

const getCompany = catchAsync(async (req, res) => {
    const company = await companyService.getCompanyById(req.params.companyId);
    if (!company) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
    }
    return res.status(200).json({
        message: "Company details", success: true, company
    });
});

const updateCompany = catchAsync(async (req, res) => {
    const company = await companyService.updateCompanyById(req.params.companyId, req.body);
    return res.status(200).json({
        message: "Company updated successfully", success: true, company
    });
});

const deleteCompany = catchAsync(async (req, res) => {
    await companyService.deleteCompanyById(req.params.companyId);
    return res.status(200).json({
        message:"Company deleted successfully",success: true
    });
});

const addUser = catchAsync(async (req, res) => {
    if (req.user.currentUserCountRemainig > 0) {
        const createPassword = generatePassword()
        Object.assign(req.body, { authType: 'email', userType: userType.USER, password: createPassword });
        const user = await userService.createUser(req.body);
        if (user) {
            const doc = {
                $push: { user: user._id },
                currentUserCountRemainig: req.user.currentUserCountRemainig - 1
            }
            await companyService.updateCompanyById(req.user._id, doc);
            await userService.updateUserById(user._id,{company:req.user._id})
            await emailService.sendEmail(req.body.email, 'Login credential', createPassword);
            return res.status(httpStatus.CREATED).json({
                message: "User added successfully", success: true, user
            });
        }
    } else {
        return res.status(200).json({
            message: "No more user can be added since limit is reached", success: true
        });
    }
});

const removeUser = catchAsync(async (req, res) => {
    const users = req.user.user
    const checkId = users.includes(req.body.userId)
    if (checkId === false) {
        return res.status(200).json({
            message: "No such user to remove with the organsiation", success: true
        });
    }
    const checkPlan = await licenseService.getLicenseById(req?.user?.licenseId);
    const companySize = checkPlan?.companySize
    if (req.user.currentUserCountRemainig < Number(companySize)) {
        const doc = {
            $pop: { user: req.body.userId },
            currentUserCountRemainig: req.user.currentUserCountRemainig + 1
        }
        await companyService.updateCompanyById(req.user._id, doc);
        return res.status(httpStatus.CREATED).json({
            message: "User removed successfully", success: true
        });

    } else {
        return res.status(200).json({
            message: "No more user left to remove further", success: true
        });
    }
});

const getCompanyAssociatedUsers = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['name']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const { search } = pick(req.query, ['search']);

    const result = await companyService.getCompanyAssociatedUsers(req.params.companyId, options, search);
    const finalData = result.data
    const pageDetails = {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        totalResults: result.totalResults
    }
    const results = finalData.map(item => item.users);
    return res.status(200).json({
        success: true,
        message: "Users list",
        result: {results, pageDetails}
    });
});

module.exports = {
    createCompany,
    getCompanys,
    getCompany,
    updateCompany,
    addUser,
    removeUser,
    getCompanyAssociatedUsers,
    deleteCompany
}