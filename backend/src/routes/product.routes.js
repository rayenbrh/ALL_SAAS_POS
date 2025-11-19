const express = require('express');
const productController = require('../controllers/product.controller');
const { protect, tenantAdminOrAbove } = require('../middleware/auth');
const { tenantFilter, validateTenantStatus } = require('../middleware/tenant');

const router = express.Router();

router.use(protect);
router.use(tenantFilter);
router.use(validateTenantStatus);

router.get('/', productController.getProducts);
router.get('/low-stock', productController.getLowStockProducts);
router.get('/:id', productController.getProduct);
router.post('/', tenantAdminOrAbove, productController.createProduct);
router.put('/:id', tenantAdminOrAbove, productController.updateProduct);
router.delete('/:id', tenantAdminOrAbove, productController.deleteProduct);

module.exports = router;
