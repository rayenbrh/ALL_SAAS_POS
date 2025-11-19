const express = require('express');
const posController = require('../controllers/pos.controller');
const { protect, authorize } = require('../middleware/auth');
const { tenantFilter, validateTenantStatus } = require('../middleware/tenant');
const { USER_ROLES } = require('../config/constants');

const router = express.Router();

// Apply auth and tenant middleware to all routes
router.use(protect);
router.use(tenantFilter);
router.use(validateTenantStatus);

// Authorize only staff roles (not super admin on POS)
const posAuthorize = authorize(
  USER_ROLES.TENANT_ADMIN,
  USER_ROLES.MANAGER,
  USER_ROLES.CASHIER,
  USER_ROLES.STAFF
);

router.post('/sale', posAuthorize, posController.createSale);
router.get('/products/search', posAuthorize, posController.searchProducts);
router.post('/hold-order', posAuthorize, posController.holdOrder);
router.get('/held-orders', posAuthorize, posController.getHeldOrders);
router.post('/retrieve-order/:id', posAuthorize, posController.retrieveHeldOrder);
router.get('/daily-summary', posAuthorize, posController.getDailySummary);

module.exports = router;
