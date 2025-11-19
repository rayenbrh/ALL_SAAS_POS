const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { protect, managerOrAbove } = require('../middleware/auth');
const { tenantFilter, validateTenantStatus } = require('../middleware/tenant');

const router = express.Router();

router.use(protect);
router.use(tenantFilter);
router.use(validateTenantStatus);

router.get('/sales', managerOrAbove, analyticsController.getSalesAnalytics);
router.get('/products', managerOrAbove, analyticsController.getProductPerformance);

module.exports = router;
