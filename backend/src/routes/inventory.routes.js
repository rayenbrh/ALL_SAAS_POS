const express = require('express');
const inventoryController = require('../controllers/inventory.controller');
const { protect, managerOrAbove } = require('../middleware/auth');
const { tenantFilter, validateTenantStatus } = require('../middleware/tenant');

const router = express.Router();

router.use(protect);
router.use(tenantFilter);
router.use(validateTenantStatus);

router.post('/stock-in', managerOrAbove, inventoryController.stockIn);
router.post('/stock-out', managerOrAbove, inventoryController.stockOut);
router.get('/movements', managerOrAbove, inventoryController.getStockMovements);

module.exports = router;
