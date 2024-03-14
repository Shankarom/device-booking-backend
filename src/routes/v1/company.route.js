const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const companyValidation = require('../../validations/company.validation');
const companyController = require('../../controllers/company.controller');
const authValidation = require('../../validations/auth.validation');
const authController = require('../../controllers/auth.controller');

const router = express.Router();

router.post('/login', validate(authValidation.login), authController.loginEmail);
router.get('/users', auth('getCompanyUsers'), companyController.getCompanyAssociatedUsers);

router
  .route('/')
  .post(auth('createCompany'), validate(companyValidation.createCompany), companyController.createCompany)
  .get(auth('getUsers'), validate(companyValidation.getCompanies), companyController.getCompanys);
  
router.patch('/delete/:companyId',auth('manageUsers'), validate(companyValidation.getCompany), companyController.deleteCompany);

router
  .route('/:companyId')
  .get(auth('getUsers'), validate(companyValidation.getCompany), companyController.getCompany)
  .patch(auth('manageUsers'), validate(companyValidation.updateCompany), companyController.updateCompany)
  .patch( auth('manageUsers'), validate(companyValidation.getCompany), companyController.deleteCompany)


router.post('/addUser', auth('addUser'), companyController.addUser);
router.post('/removeUser', auth('removeUser'), companyController.removeUser);

module.exports = router;