const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createDevice = {
    body: Joi.object().keys({
      name: Joi.string().required(),
      deviceType: Joi.string().required(),
      description: Joi.string(),
      purpose: Joi.string(),
      price: Joi.string().required(),
      runningDuration: Joi.string().required(),
      location: Joi.string().required()
    }),
};

const getDevices = {
  query: Joi.object().keys({
    name: Joi.string(),
    search: Joi.string().allow(''),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getDevice = {
  params: Joi.object().keys({
    deviceId: Joi.string().custom(objectId),
  }),
};

const updateDevice = {
  params: Joi.object().keys({
    deviceId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string()
    })
    .min(1),
};

const deleteDevice = {
  params: Joi.object().keys({
    deviceId: Joi.string().custom(objectId),
  }),
};

module.exports = {
    createDevice,
    getDevices,
    getDevice,
    updateDevice,
    deleteDevice
}