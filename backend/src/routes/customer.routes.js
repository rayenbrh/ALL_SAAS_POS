const express = require('express');
const customerController = require('../controllers/customer.controller');
const { protect } = require('../middleware/auth');
const { tenantFilter, validateTenantStatus } = require('../middleware/tenant');

const router = express.Router();

router.use(protect);
router.use(tenantFilter);
router.use(validateTenantStatus);

router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomer);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
