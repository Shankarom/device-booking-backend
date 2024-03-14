const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const licenseValidation = require('../../validations/license.validation');
const licenseController = require('../../controllers/license.controller');

const router = express.Router();

router
    .route('/')
    .post(auth('managePlans'), validate(licenseValidation.createLicense), licenseController.createLicense)
    .get(auth('getPlans'), licenseController.getLicense);

router
    .route('/:licenseId')
    // .get(auth('getPlans'), licenseController.g)
    .patch(auth('managePlans'), validate(licenseValidation.updateLicense), licenseController.updateLicense)
    .delete(auth('managePlans'), validate(licenseValidation.deleteLicense), licenseController.deleteLicense);

module.exports = router;