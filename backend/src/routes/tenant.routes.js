const express = require('express');
const tenantController = require('../controllers/tenant.controller');
const { protect, tenantAdminOrAbove } = require('../middleware/auth');
const { tenantFilter, validateTenantStatus } = require('../middleware/tenant');

const router = express.Router();

router.use(protect);
router.use(tenantFilter);
router.use(validateTenantStatus);

router.get('/dashboard', tenantController.getDashboard);
router.get('/settings', tenantAdminOrAbove, tenantController.getSettings);
router.put('/settings', tenantAdminOrAbove, tenantController.updateSettings);
router.put('/settings/branding', tenantAdminOrAbove, tenantController.updateBranding);

module.exports = router;
