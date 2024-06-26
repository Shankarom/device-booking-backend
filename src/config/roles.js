const allRoles = {
  user: [],
  superadmin: ['getUsers', 'manageUsers', 'getDevice', 'manageDevices', 'managePlans', 'getPlans','createCompany','getBookings','getCompanyUsers'],
  company:['removeUser', 'addUser', 'getCompanyUsers'],
  manager:['getBookings','getDevice']
};
const bookingStatus = {
  PENDING: 'pending',
  APPROVED: 'approve',
  REJECTED: 'reject'
};

const userType = {
  USER: 'user',
  SUPERADMIN: 'superadmin',
  MANAGER: 'manager',
  COMPANY: 'company'
};
const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
  bookingStatus,
  userType
};
