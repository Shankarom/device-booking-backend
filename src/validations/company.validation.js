const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createCompany = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
        // password: Joi.string().required().custom(password),
        companyName: Joi.string().required(),
        companyType: Joi.string(),
        companyHead: Joi.string(),
        website: Joi.string(),
        address: Joi.string(),
        companyLogo: Joi.string(),
        industry: Joi.string(),
        founded: Joi.string(),
        licenseId: Joi.string().custom(objectId)
    }),
};

const getCompanies = {
    query: Joi.object().keys({
      companyName: Joi.string(),
      email: Joi.string(),
      search: Joi.string().allow(''),
      sortBy: Joi.string(),
      limit: Joi.number().integer(),
      page: Joi.number().integer(),
    }),
  };

const getCompany = {
    params: Joi.object().keys({
      companyId: Joi.string().custom(objectId),
    }),
};

const updateCompany = {
    params: Joi.object().keys({
      companyId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
      .keys({
        companyName: Joi.string(),
        companyType: Joi.string(),
        website: Joi.string(),
        address: Joi.string(),
        companyHead: Joi.string(),
        companyLogo: Joi.string(),
        industry: Joi.string(),
        founded: Joi.string(),
        email: Joi.string().email(),
        licenseId: Joi.string().custom(objectId)
      })
      .min(1),
};
  
const deleteLicense = {
    params: Joi.object().keys({
      licenseId: Joi.string().custom(objectId),
    }),
};

module.exports = {
    createCompany,
    getCompanies,
    getCompany,
    updateCompany,
    deleteLicense
}