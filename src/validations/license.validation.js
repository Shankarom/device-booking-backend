const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createLicense = {
    body: Joi.object().keys({
      name: Joi.string().required(),
      maxUsers: Joi.string(),
      companySize: Joi.string()
    }),
};

const updateLicense = {
    params: Joi.object().keys({
      licenseId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
      .keys({
        name: Joi.string(),
        maxUsers: Joi.string(),
        companySize: Joi.string()
      })
      .min(1),
};
  
const deleteLicense = {
    params: Joi.object().keys({
      licenseId: Joi.string().custom(objectId),
    }),
};
module.exports = {
    createLicense,
    updateLicense,
    deleteLicense
}