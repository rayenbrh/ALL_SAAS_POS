const express = require('express');
const superadminController = require('../controllers/superadmin.controller');
const { protect, superAdminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(superAdminOnly);

router.get('/dashboard', superadminController.getDashboard);
router.get('/tenants', superadminController.getTenants);
router.post('/tenants', superadminController.createTenant);
router.put('/tenants/:id', superadminController.updateTenant);
router.delete('/tenants/:id', superadminController.deleteTenant);
router.post('/impersonate/:id', superadminController.impersonateTenant);
router.get('/plans', superadminController.getSubscriptionPlans);
router.post('/plans', superadminController.createSubscriptionPlan);

module.exports = router;
