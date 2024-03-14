const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const managerController = require('../../controllers/manager.controller');

const router = express.Router();
router.get('/approval', auth(), managerController.managerRequestList);
router.post('/markStatus/:requestId', auth(), managerController.approvingRequest);

router
    .route('/')
    .post(auth('manageUsers'), validate(userValidation.createManager), managerController.createManager)
    .get(auth('getUsers'), validate(userValidation.getManagers), managerController.getManagers);

router
    .route('/:managerId')
    .get(auth('getUsers'), validate(userValidation.getManager), managerController.getManager)
    .patch(auth('manageUsers'), validate(userValidation.updateManager), managerController.updateManager)
    .delete(auth('manageUsers'), validate(userValidation.deleteManager), managerController.deleteManager)

router.get('/devices/:managerId', auth(), validate(userValidation.getManager), managerController.getManagerAssignedDevices);


module.exports = router;