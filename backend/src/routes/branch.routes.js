const express = require('express');
const branchController = require('../controllers/branch.controller');
const { protect, tenantAdminOrAbove } = require('../middleware/auth');
const { tenantFilter, validateTenantStatus, checkFeature } = require('../middleware/tenant');
const { FEATURES } = require('../config/constants');

const router = express.Router();

router.use(protect);
router.use(tenantFilter);
router.use(validateTenantStatus);
router.use(tenantAdminOrAbove);
router.use(checkFeature(FEATURES.BRANCHES));

router.get('/', branchController.getBranches);
router.post('/', branchController.createBranch);
router.put('/:id', branchController.updateBranch);
router.delete('/:id', branchController.deleteBranch);

module.exports = router;
