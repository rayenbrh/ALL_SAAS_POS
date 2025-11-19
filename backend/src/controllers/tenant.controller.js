const Tenant = require('../models/Tenant.model');
const Sale = require('../models/Sale.model');
const Product = require('../models/Product.model');
const { successResponse } = require('../utils/response');

// Get tenant dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySales = await Sale.aggregate([
      { $match: { tenantId, saleDate: { $gte: today }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
    ]);

    const stats = {
      todayRevenue: todaySales[0]?.total || 0,
      todaySales: todaySales[0]?.count || 0,
      totalProducts: await Product.countDocuments({ tenantId, isActive: true }),
      lowStockProducts: await Product.countDocuments({ tenantId, isLowStock: true }),
    };

    successResponse(res, 200, 'Dashboard stats retrieved', { stats });
  } catch (error) {
    next(error);
  }
};

// Get tenant settings
exports.getSettings = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.tenantId);

    successResponse(res, 200, 'Settings retrieved', { tenant });
  } catch (error) {
    next(error);
  }
};

// Update tenant settings
exports.updateSettings = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(
      req.tenantId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    successResponse(res, 200, 'Settings updated successfully', { tenant });
  } catch (error) {
    next(error);
  }
};

// Update branding
exports.updateBranding = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.tenantId);

    tenant.branding = { ...tenant.branding, ...req.body };
    await tenant.save();

    successResponse(res, 200, 'Branding updated successfully', { branding: tenant.branding });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
