const httpStatus = require('http-status');
const { Company } = require('../models');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');

/**
 * Create a company
 * @param {Object} companyBody
 * @returns {Promise<Company>}
 */
const createCompany = async (companyBody) => {
    if (await Company.isEmailTaken(companyBody.email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
    return Company.create(companyBody);
};

/**
 * Query for Company
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} search - Text string to search in search fields
 * @returns {Promise<QueryResult>}
 */
const queryCompanies = async (filter, options, search) => {
    const companies = await Company.paginate(filter, options, search);
    return companies;
};

/**
 * Get company by id
 * @param {ObjectId} id
 * @returns {Promise<Company>}
 */
const getCompanyById = async (id) => {
    return Company.findById(id);
};

/**
 * Get company by id
 * @param {ObjectId} id
 * @returns {Promise<Company>}
 */
const getCompanyId = async (condition) => {
  return Company.findOne(condition).populate('licenseId', 'maxUsers');
};

/**
 * Update Company by id
 * @param {ObjectId} companyId
 * @param {Object} updateBody
 * @returns {Promise<Company>}
 */
const updateCompanyById = async (companyId, updateBody) => {
    const company = await getCompanyById(companyId);
    if (!company) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
    }
    if (await Company.isEmailTaken(updateBody.email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
    if (updateBody.$push && updateBody.$push.user) {
        company.user.push(updateBody.$push.user);
        delete updateBody.$push.user;
    }
    if (updateBody.$pop && updateBody.$pop.user) {
        const userIdToRemove = updateBody.$pop.user;
        const index = company.user.indexOf(userIdToRemove);
        if (index !== -1) {
            company.user.splice(index, 1);
        }
        delete updateBody.$pop.user;
    }
    Object.assign(company, updateBody);
    await company.save();
    return company;
};

/**
 * Get Company's users
 * @param {ObjectId} companyId
 * @returns {Promise<Company>}
 */
const getCompanyAssociatedUsers = async (companyId,options, search) => {
  
    const pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(companyId)
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'users'
        }
      },
      {
        $unwind:{
          path:'$users'
        }
      },
      {
        $match:{
          'users.isDeleted': false
        }
      }
    ];
    
    // Conditionally apply the $match stage for searching by name
    if (search && typeof search === 'string' && search.trim() !== '') {
      pipeline.push({
        $match: {
            $or: [
                { 'users.firstName': { $regex: search, $options: 'i' } },
                { 'users.lastName': { $regex: search, $options: 'i' } },
                { 'users.email': { $regex: search, $options: 'i' } }
            ]
        }
      });
    }
    
    pipeline.push({
      $project: {
        users: 1,
        _id: 0
      }
    });
    
    const users = await Company.aggregateWithPagination(pipeline, options);  
  
    return users;
  };

/**
 * Delete company by id
 * @param {ObjectId} companyId
 * @returns {Promise<Company>}
 */
const deleteCompanyById = async (companyId) => {
  const company = await getCompanyById(companyId);
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, 'company not found');
  }
  await Company.updateOne({_id:companyId},{isDeleted: true});
  return company;
};
module.exports = {
    createCompany,
    queryCompanies,
    getCompanyById,
    updateCompanyById,
    getCompanyAssociatedUsers,
    deleteCompanyById,
    getCompanyId
}