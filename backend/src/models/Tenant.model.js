const mongoose = require('mongoose');
const slugify = require('slugify');
const { SUBSCRIPTION_STATUS, FEATURES } = require('../config/constants');

const tenantSchema = new mongoose.Schema(
  {
    // Business Information
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    subdomain: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'],
    },

    customDomain: {
      type: String,
      default: null,
      lowercase: true,
    },

    // Business Details
    businessType: {
      type: String,
      enum: [
        'grocery',
        'supermarket',
        'restaurant',
        'cafe',
        'bakery',
        'pharmacy',
        'clothing',
        'electronics',
        'hardware',
        'general',
        'other',
      ],
      default: 'general',
    },

    description: String,

    // Contact Information
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    // Address
    address: {
      street: String,
      city: String,
      state: String,
      governorate: String,
      postalCode: String,
      country: {
        type: String,
        default: 'Tunisia',
      },
    },

    // Tax Information
    taxId: String,
    vatNumber: String,

    // Branding
    branding: {
      logo: String,
      favicon: String,
      primaryColor: {
        type: String,
        default: '#3B82F6',
      },
      secondaryColor: {
        type: String,
        default: '#1E40AF',
      },
      accentColor: {
        type: String,
        default: '#10B981',
      },
    },

    // Subscription Details
    subscription: {
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
      },

      status: {
        type: String,
        enum: Object.values(SUBSCRIPTION_STATUS),
        default: SUBSCRIPTION_STATUS.TRIAL,
      },

      currentPeriodStart: Date,
      currentPeriodEnd: Date,

      trialEndsAt: {
        type: Date,
        default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      },

      // Feature flags (determined by subscription plan)
      features: {
        [FEATURES.ANALYTICS]: { type: Boolean, default: true },
        [FEATURES.MULTI_UNIT]: { type: Boolean, default: true },
        [FEATURES.BRANCHES]: { type: Boolean, default: false },
        [FEATURES.STAFF_MANAGEMENT]: { type: Boolean, default: true },
        [FEATURES.DISCOUNTS]: { type: Boolean, default: true },
        [FEATURES.LOYALTY]: { type: Boolean, default: false },
        [FEATURES.CUSTOM_BRANDING]: { type: Boolean, default: false },
        [FEATURES.EXPORTING]: { type: Boolean, default: true },
        [FEATURES.STOCK_ALERTS]: { type: Boolean, default: true },
        [FEATURES.EXPIRATION_TRACKING]: { type: Boolean, default: true },
        [FEATURES.CUSTOMER_CREDIT]: { type: Boolean, default: false },
        [FEATURES.MULTI_PAYMENT]: { type: Boolean, default: true },
        [FEATURES.RECEIPTS_CUSTOMIZATION]: { type: Boolean, default: false },
        [FEATURES.API_ACCESS]: { type: Boolean, default: false },
      },

      // Limits based on plan
      limits: {
        maxProducts: {
          type: Number,
          default: 100,
        },
        maxStaff: {
          type: Number,
          default: 3,
        },
        maxBranches: {
          type: Number,
          default: 1,
        },
        maxCustomers: {
          type: Number,
          default: 1000,
        },
        maxTransactionsPerMonth: {
          type: Number,
          default: 500,
        },
        storageLimit: {
          type: Number, // in MB
          default: 500,
        },
      },
    },

    // Usage Metrics
    usage: {
      productsCount: {
        type: Number,
        default: 0,
      },
      staffCount: {
        type: Number,
        default: 0,
      },
      branchesCount: {
        type: Number,
        default: 1,
      },
      customersCount: {
        type: Number,
        default: 0,
      },
      transactionsThisMonth: {
        type: Number,
        default: 0,
      },
      storageUsed: {
        type: Number, // in MB
        default: 0,
      },
      lastTransactionDate: Date,
    },

    // Settings
    settings: {
      currency: {
        type: String,
        default: 'TND',
      },
      language: {
        type: String,
        enum: ['ar', 'fr', 'en'],
        default: 'fr',
      },
      timezone: {
        type: String,
        default: 'Africa/Tunis',
      },
      dateFormat: {
        type: String,
        default: 'DD/MM/YYYY',
      },
      timeFormat: {
        type: String,
        enum: ['12h', '24h'],
        default: '24h',
      },
      taxRate: {
        type: Number,
        default: 19, // Tunisia VAT 19%
      },
      receiptFooter: String,
      receiptHeader: String,
      enableEmailReceipts: {
        type: Boolean,
        default: false,
      },
      enableSMSNotifications: {
        type: Boolean,
        default: false,
      },
      lowStockThreshold: {
        type: Number,
        default: 10,
      },
      autoBackup: {
        type: Boolean,
        default: true,
      },
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    isSuspended: {
      type: Boolean,
      default: false,
    },

    suspensionReason: String,

    // Billing
    billing: {
      lastPaymentDate: Date,
      lastPaymentAmount: Number,
      nextBillingDate: Date,
      paymentMethod: String,
      totalRevenue: {
        type: Number,
        default: 0,
      },
    },

    // Metadata
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    onboardingSteps: {
      businessInfo: { type: Boolean, default: false },
      branding: { type: Boolean, default: false },
      products: { type: Boolean, default: false },
      staff: { type: Boolean, default: false },
      firstSale: { type: Boolean, default: false },
    },

    // Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    notes: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
tenantSchema.index({ subdomain: 1 });
tenantSchema.index({ customDomain: 1 });
tenantSchema.index({ 'subscription.status': 1 });
tenantSchema.index({ isActive: 1 });
tenantSchema.index({ createdAt: -1 });

// Virtual: Is subscription active
tenantSchema.virtual('isSubscriptionActive').get(function () {
  return (
    this.subscription.status === SUBSCRIPTION_STATUS.ACTIVE ||
    this.subscription.status === SUBSCRIPTION_STATUS.TRIAL
  );
});

// Virtual: Days until trial ends
tenantSchema.virtual('trialDaysRemaining').get(function () {
  if (this.subscription.status !== SUBSCRIPTION_STATUS.TRIAL) {
    return 0;
  }
  const now = new Date();
  const trialEnd = new Date(this.subscription.trialEndsAt);
  const diffTime = trialEnd - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Generate slug before saving
tenantSchema.pre('save', function (next) {
  if (this.isModified('businessName') && !this.slug) {
    this.slug = slugify(this.businessName, { lower: true, strict: true });
  }

  // Generate subdomain if not provided
  if (!this.subdomain) {
    this.subdomain = this.slug || slugify(this.businessName, { lower: true, strict: true });
  }

  next();
});

// Method: Check if feature is enabled
tenantSchema.methods.hasFeature = function (featureName) {
  return this.subscription.features[featureName] === true;
};

// Method: Check if within limits
tenantSchema.methods.withinLimit = function (limitName) {
  const limit = this.subscription.limits[limitName];
  const usage = this.usage[limitName.replace('max', '').toLowerCase() + 'Count'];

  if (limit === -1) return true; // -1 means unlimited
  return usage < limit;
};

// Static method: Find active tenants
tenantSchema.statics.findActive = function () {
  return this.find({ isActive: true, isSuspended: false });
};

module.exports = mongoose.model('Tenant', tenantSchema);
