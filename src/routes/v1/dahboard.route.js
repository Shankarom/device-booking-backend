const express = require('express');
const auth = require('../../middlewares/auth');
const dashboardController = require('../../controllers/dashboard.controller');

const router = express.Router();

router.get('/details', auth(), dashboardController.dashboardDetails);
router.get('/deviceBooking', auth(), dashboardController.getDevicesBookedDetails);

module.exports = router;