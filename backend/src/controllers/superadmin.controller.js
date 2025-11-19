const Tenant = require('../models/Tenant.model');
const User = require('../models/User.model');
const Sale = require('../models/Sale.model');
const SubscriptionPlan = require('../models/SubscriptionPlan.model');
const { AppError } = require('../middleware/errorHandler');
const { successResponse, paginatedResponse } = require('../utils/response');
const { generateTokens } = require('../utils/jwt');

// Get dashboard stats
exports.getDashboard = async (req, res, next) => {
  try {
    const totalTenants = await Tenant.countDocuments();
    const activeTenants = await Tenant.countDocuments({ isActive: true });
    const trialTenants = await Tenant.countDocuments({ 'subscription.status': 'trial' });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const salesThisMonth = await Sale.aggregate([
      { $match: { saleDate: { $gte: startOfMonth }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
    ]);

    const stats = {
      totalTenants,
      activeTenants,
      trialTenants,
      suspendedTenants: await Tenant.countDocuments({ isSuspended: true }),
      monthlyRevenue: salesThisMonth[0]?.total || 0,
      monthlySales: salesThisMonth[0]?.count || 0,
    };

    successResponse(res, 200, 'Dashboard stats retrieved', { stats });
  } catch (error) {
    next(error);
  }
};

// Get all tenants
exports.getTenants = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subdomain: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query['subscription.status'] = status;

    const tenants = await Tenant.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Tenant.countDocuments(query);

    paginatedResponse(res, tenants, page, limit, count);
  } catch (error) {
    next(error);
  }
};

// Create tenant
exports.createTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.create({
      ...req.body,
      createdBy: req.user.id,
    });

    successResponse(res, 201, 'Tenant created successfully', { tenant });
  } catch (error) {
    next(error);
  }
};

// Update tenant
exports.updateTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!tenant) {
      return next(new AppError('Tenant not found', 404));
    }

    successResponse(res, 200, 'Tenant updated successfully', { tenant });
  } catch (error) {
    next(error);
  }
};

// Delete tenant
exports.deleteTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByIdAndDelete(req.params.id);

    if (!tenant) {
      return next(new AppError('Tenant not found', 404));
    }

    // Delete all users for this tenant
    await User.deleteMany({ tenantId: tenant._id });

    successResponse(res, 200, 'Tenant deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Impersonate tenant
exports.impersonateTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return next(new AppError('Tenant not found', 404));
    }

    // Find tenant admin
    const admin = await User.findOne({ tenantId: tenant._id, role: 'tenant_admin' });

    if (!admin) {
      return next(new AppError('Tenant admin not found', 404));
    }

    // Generate tokens for tenant admin
    const tokens = generateTokens(admin._id);

    successResponse(res, 200, 'Impersonation successful', {
      ...tokens,
      user: admin,
      tenant,
    });
  } catch (error) {
    next(error);
  }
};

// Get subscription plans
exports.getSubscriptionPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find().sort({ price: 1 });

    successResponse(res, 200, 'Plans retrieved successfully', { plans });
  } catch (error) {
    next(error);
  }
};

// Create subscription plan
exports.createSubscriptionPlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.create(req.body);

    successResponse(res, 201, 'Plan created successfully', { plan });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
