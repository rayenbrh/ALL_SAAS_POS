const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const User = require('../models/User.model');
const { USER_ROLES } = require('../config/constants');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      // Check if user is active
      if (!user.isActive) {
        return next(new AppError('User account is deactivated', 403));
      }

      // Attach user to request
      req.user = user;

      // Attach tenantId to request (if not super admin)
      if (user.role !== USER_ROLES.SUPER_ADMIN) {
        req.tenantId = user.tenantId;
      }

      next();
    } catch (err) {
      return next(new AppError('Not authorized to access this route', 401));
    }
  } catch (error) {
    next(error);
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Super admin only
const superAdminOnly = (req, res, next) => {
  if (req.user.role !== USER_ROLES.SUPER_ADMIN) {
    return next(
      new AppError('This route is only accessible by super admins', 403)
    );
  }
  next();
};

// Tenant admin or above
const tenantAdminOrAbove = (req, res, next) => {
  const allowedRoles = [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.TENANT_ADMIN,
  ];

  if (!allowedRoles.includes(req.user.role)) {
    return next(
      new AppError('You do not have permission to perform this action', 403)
    );
  }
  next();
};

// Manager or above
const managerOrAbove = (req, res, next) => {
  const allowedRoles = [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.TENANT_ADMIN,
    USER_ROLES.MANAGER,
  ];

  if (!allowedRoles.includes(req.user.role)) {
    return next(
      new AppError('You do not have permission to perform this action', 403)
    );
  }
  next();
};

// Verify tenant ownership (ensure user can only access their tenant's data)
const verifyTenantOwnership = (req, res, next) => {
  // Super admin can access all tenants
  if (req.user.role === USER_ROLES.SUPER_ADMIN) {
    return next();
  }

  // Check if tenantId in request matches user's tenantId
  const requestTenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;

  if (requestTenantId && requestTenantId.toString() !== req.user.tenantId.toString()) {
    return next(
      new AppError('You do not have permission to access this tenant', 403)
    );
  }

  next();
};

// Check feature access for tenant
const checkFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      // Super admin has access to all features
      if (req.user.role === USER_ROLES.SUPER_ADMIN) {
        return next();
      }

      // Get tenant and check feature
      const Tenant = require('../models/Tenant.model');
      const tenant = await Tenant.findById(req.tenantId);

      if (!tenant) {
        return next(new AppError('Tenant not found', 404));
      }

      // Check if feature is enabled in subscription plan
      if (!tenant.subscription.features[featureName]) {
        return next(
          new AppError(
            `Feature '${featureName}' is not enabled in your subscription plan`,
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
  protect,
  authorize,
  superAdminOnly,
  tenantAdminOrAbove,
  managerOrAbove,
  verifyTenantOwnership,
  checkFeature,
};
