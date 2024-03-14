const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const deviceValidation = require('../../validations/device.validation');
const deviceController = require('../../controllers/device.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageDevices'), validate(deviceValidation.createDevice), deviceController.createDevice)
  .get(auth('getDevice'), validate(deviceValidation.getDevices), deviceController.getDevices);

router
  .route('/:deviceId')
  .get(auth('getDevice'), validate(deviceValidation.getDevice), deviceController.getDevice)
  .patch(auth('manageDevices'), validate(deviceValidation.updateDevice), deviceController.updateDevice)
  .delete(auth('manageDevices'), validate(deviceValidation.deleteDevice), deviceController.deleteDevice)

module.exports = router;