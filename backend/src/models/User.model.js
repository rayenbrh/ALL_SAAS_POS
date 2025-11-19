const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { USER_ROLES } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    // Tenant reference (null for super admin)
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      default: null,
      index: true,
    },

    // Branch reference (for multi-branch support)
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },

    // Basic Info
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },

    phone: {
      type: String,
      trim: true,
    },

    // Role-based access control
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CASHIER,
    },

    // Permissions (granular control)
    permissions: {
      canViewSales: { type: Boolean, default: true },
      canCreateSales: { type: Boolean, default: true },
      canDeleteSales: { type: Boolean, default: false },
      canManageProducts: { type: Boolean, default: false },
      canManageInventory: { type: Boolean, default: false },
      canManageCustomers: { type: Boolean, default: true },
      canViewReports: { type: Boolean, default: false },
      canManageStaff: { type: Boolean, default: false },
      canManageSettings: { type: Boolean, default: false },
      canGiveDiscounts: { type: Boolean, default: false },
      canRefund: { type: Boolean, default: false },
    },

    // Profile
    avatar: {
      type: String,
      default: null,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // Security
    refreshToken: {
      type: String,
      select: false,
    },

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Preferences
    language: {
      type: String,
      enum: ['ar', 'fr', 'en'],
      default: 'fr',
    },

    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light',
    },

    // Timestamps for last login
    lastLogin: Date,

    // Employee specific fields
    employeeId: String,
    hireDate: Date,
    salary: Number,
    commission: Number,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Index for performance
userSchema.index({ email: 1, tenantId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) {
    return next();
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Tenant-scoped query (auto-filter by tenantId)
userSchema.pre(/^find/, function (next) {
  // Skip if this is a super admin query or tenantId is already set
  if (this.getQuery().skipTenantFilter || this.getQuery().tenantId !== undefined) {
    return next();
  }

  // If tenantId is in options, filter by it
  if (this.options.tenantId) {
    this.where({ tenantId: this.options.tenantId });
  }

  next();
});

module.exports = mongoose.model('User', userSchema);
