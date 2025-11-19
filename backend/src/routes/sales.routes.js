const express = require('express');
const salesController = require('../controllers/sales.controller');
const { protect } = require('../middleware/auth');
const { tenantFilter, validateTenantStatus } = require('../middleware/tenant');

const router = express.Router();

router.use(protect);
router.use(tenantFilter);
router.use(validateTenantStatus);

router.get('/', salesController.getSales);
router.get('/:id', salesController.getSale);

module.exports = router;
