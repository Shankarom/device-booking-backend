const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const deviceRoute = require('./device.route');
const managerRoute = require('./manager.route');
const licenseRoute = require('./license.route');
const companyRoute = require('./company.route');
const dashboardRoute = require('./dahboard.route');
const bookingRoute = require('./booking.route');
const docsRoute = require('./docs.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/device',
    route: deviceRoute,
  },
  {
    path: '/manager',
    route: managerRoute,
  },
  {
    path: '/license',
    route: licenseRoute,
  },
  {
    path: '/company',
    route: companyRoute,
  },
  {
    path: '/dashboard',
    route: dashboardRoute,
  },
  {
    path: '/booking',
    route: bookingRoute,
  }
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
