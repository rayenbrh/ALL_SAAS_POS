const User = require('../models/User.model');
const Tenant = require('../models/Tenant.model');
const { AppError } = require('../middleware/errorHandler');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');
const { successResponse } = require('../utils/response');
const crypto = require('crypto');
const { USER_ROLES, SUBSCRIPTION_STATUS } = require('../config/constants');

/**
 * @desc    Register new tenant with admin user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const {
      businessName,
      email,
      password,
      firstName,
      lastName,
      phone,
      subdomain,
      businessType,
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    // Check if subdomain is taken
    if (subdomain) {
      const existingTenant = await Tenant.findOne({ subdomain });
      if (existingTenant) {
        return next(new AppError('Subdomain already taken', 400));
      }
    }

    // Create tenant
    const tenant = await Tenant.create({
      businessName,
      subdomain,
      email,
      phone,
      businessType,
      subscription: {
        status: SUBSCRIPTION_STATUS.TRIAL,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },
    });

    // Create admin user for this tenant
    const user = await User.create({
      tenantId: tenant._id,
      email,
      password,
      firstName,
      lastName,
      phone,
      role: USER_ROLES.TENANT_ADMIN,
      isActive: true,
      isEmailVerified: true, // Auto-verify for now
      permissions: {
        canViewSales: true,
        canCreateSales: true,
        canDeleteSales: true,
        canManageProducts: true,
        canManageInventory: true,
        canManageCustomers: true,
        canViewReports: true,
        canManageStaff: true,
        canManageSettings: true,
        canGiveDiscounts: true,
        canRefund: true,
      },
    });

    // Update tenant with creator
    tenant.createdBy = user._id;
    await tenant.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Send response
    successResponse(res, 201, 'Registration successful', {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
      tenant: {
        id: tenant._id,
        businessName: tenant.businessName,
        subdomain: tenant.subdomain,
        subscription: tenant.subscription,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('Account is deactivated', 403));
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Get tenant and check status (skip for super admin)
    let tenant = null;
    if (user.role !== USER_ROLES.SUPER_ADMIN) {
      tenant = await Tenant.findById(user.tenantId);

      if (!tenant) {
        return next(new AppError('Tenant not found', 404));
      }

      if (!tenant.isActive || tenant.isSuspended) {
        return next(new AppError('Tenant account is suspended', 403));
      }

      // Check subscription status
      const validStatuses = [SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.TRIAL];
      if (!validStatuses.includes(tenant.subscription.status)) {
        return next(new AppError('Subscription is not active', 403));
      }
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Send response
    successResponse(res, 200, 'Login successful', {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
        permissions: user.permissions,
        avatar: user.avatar,
        language: user.language,
        theme: user.theme,
      },
      tenant: tenant ? {
        id: tenant._id,
        businessName: tenant.businessName,
        subdomain: tenant.subdomain,
        branding: tenant.branding,
        subscription: tenant.subscription,
        settings: tenant.settings,
      } : null,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check if refresh token matches
    if (user.refreshToken !== refreshToken) {
      return next(new AppError('Invalid refresh token', 401));
    }

    // Generate new tokens
    const tokens = generateTokens(user._id);

    // Save new refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    successResponse(res, 200, 'Token refreshed successfully', tokens);
  } catch (error) {
    next(new AppError('Invalid or expired refresh token', 401));
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
  try {
    // Clear refresh token
    const user = await User.findById(req.user.id);
    user.refreshToken = null;
    await user.save();

    successResponse(res, 200, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    let tenant = null;
    if (user.role !== USER_ROLES.SUPER_ADMIN) {
      tenant = await Tenant.findById(user.tenantId);
    }

    successResponse(res, 200, 'User retrieved successfully', {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
        permissions: user.permissions,
        avatar: user.avatar,
        language: user.language,
        theme: user.theme,
      },
      tenant: tenant ? {
        id: tenant._id,
        businessName: tenant.businessName,
        subdomain: tenant.subdomain,
        branding: tenant.branding,
        subscription: tenant.subscription,
        settings: tenant.settings,
      } : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, language, theme, avatar } = req.body;

    const user = await User.findById(req.user.id);

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (language) user.language = language;
    if (theme) user.theme = theme;
    if (avatar) user.avatar = avatar;

    await user.save();

    successResponse(res, 200, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return next(new AppError('Current password is incorrect', 400));
    }

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    successResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save();

    // TODO: Send email with reset token
    // For now, just return the token (in production, send via email)

    successResponse(res, 200, 'Password reset token sent to email', {
      resetToken, // Remove this in production
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user by token and check expiry
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();

    successResponse(res, 200, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};
