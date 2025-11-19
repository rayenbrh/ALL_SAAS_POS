const { AppError } = require('./errorHandler');
const { USER_ROLES } = require('../config/constants');

/**
 * Middleware to automatically add tenantId to database queries
 * This ensures data isolation between tenants
 */
const tenantFilter = (req, res, next) => {
  // Super admin can access all data, skip tenant filtering
  if (req.user && req.user.role === USER_ROLES.SUPER_ADMIN) {
    req.skipTenantFilter = true;
    return next();
  }

  // For all other users, enforce tenant filtering
  if (req.user && req.user.tenantId) {
    req.tenantId = req.user.tenantId;
  } else if (!req.user) {
    return next(new AppError('Authentication required', 401));
  } else {
    return next(new AppError('Tenant information missing', 400));
  }

  next();
};

/**
 * Extract tenant from subdomain
 * Example: tenant1.yourdomain.com -> tenant1
 */
const extractTenantFromSubdomain = async (req, res, next) => {
  try {
    const host = req.get('host');
    const subdomain = host.split('.')[0];

    // Skip if localhost or direct IP
    if (
      host.includes('localhost') ||
      host.match(/^\d+\.\d+\.\d+\.\d+/) ||
      subdomain === 'www' ||
      subdomain === host // no subdomain
    ) {
      return next();
    }

    // Find tenant by subdomain
    const Tenant = require('../models/Tenant.model');
    const tenant = await Tenant.findOne({ subdomain, isActive: true });

    if (tenant) {
      req.tenantFromDomain = tenant;
      req.tenantId = tenant._id;
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate tenant is active and subscription is valid
 */
const validateTenantStatus = async (req, res, next) => {
  try {
    // Skip for super admin
    if (req.user && req.user.role === USER_ROLES.SUPER_ADMIN) {
      return next();
    }

    if (!req.tenantId) {
      return next(new AppError('Tenant not found', 404));
    }

    const Tenant = require('../models/Tenant.model');
    const tenant = await Tenant.findById(req.tenantId);

    if (!tenant) {
      return next(new AppError('Tenant not found', 404));
    }

    // Check if tenant is active
    if (!tenant.isActive) {
      return next(
        new AppError('Tenant account is deactivated. Please contact support.', 403)
      );
    }

    // Check subscription status
    const validStatuses = ['active', 'trial'];
    if (!validStatuses.includes(tenant.subscription.status)) {
      return next(
        new AppError(
          'Subscription is not active. Please renew your subscription.',
          403
        )
      );
    }

    // Check if subscription is expired
    if (
      tenant.subscription.currentPeriodEnd &&
      new Date(tenant.subscription.currentPeriodEnd) < new Date()
    ) {
      return next(
        new AppError('Subscription has expired. Please renew.', 403)
      );
    }

    // Attach tenant to request
    req.tenant = tenant;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Add tenant context to query
 * This can be used with Mongoose middleware
 */
const addTenantToQuery = function (tenantId) {
  return function (next) {
    if (tenantId && !this.getQuery().tenantId) {
      this.where({ tenantId });
    }
    next();
  };
};

/**
 * Middleware to check if a specific feature is enabled for the tenant
 * Usage: router.use(checkFeature(FEATURES.BRANCHES))
 */
const checkFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      // Skip for super admin
      if (req.user && req.user.role === USER_ROLES.SUPER_ADMIN) {
        return next();
      }

      // Ensure tenant is loaded (should be set by validateTenantStatus)
      if (!req.tenant) {
        return next(new AppError('Tenant information not found', 500));
      }

      // Check if feature is enabled
      if (!req.tenant.hasFeature(featureName)) {
        return next(
          new AppError(
            `This feature (${featureName}) is not available in your current subscription plan. Please upgrade to access this feature.`,
            403
          )
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  tenantFilter,
  extractTenantFromSubdomain,
  validateTenantStatus,
  addTenantToQuery,
  checkFeature,
};
