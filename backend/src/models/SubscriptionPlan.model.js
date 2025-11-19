const mongoose = require('mongoose');
const { BILLING_CYCLES, FEATURES } = require('../config/constants');

const subscriptionPlanSchema = new mongoose.Schema(
  {
    // Plan Details
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: true,
    },

    // Pricing
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },

    currency: {
      type: String,
      default: 'TND',
    },

    billingCycle: {
      type: String,
      enum: Object.values(BILLING_CYCLES),
      default: BILLING_CYCLES.MONTHLY,
    },

    // Trial
    trialDays: {
      type: Number,
      default: 14,
    },

    // Features
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

    // Limits
    limits: {
      maxProducts: {
        type: Number,
        default: 100,
        // -1 for unlimited
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

    // Display
    isPopular: {
      type: Boolean,
      default: false,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    isPublic: {
      type: Boolean,
      default: true,
    },

    // Metadata
    metadata: {
      color: String,
      icon: String,
      badge: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index
subscriptionPlanSchema.index({ slug: 1 });
subscriptionPlanSchema.index({ isActive: 1, isPublic: 1 });

// Virtual: Price per month (for comparison)
subscriptionPlanSchema.virtual('pricePerMonth').get(function () {
  if (this.billingCycle === BILLING_CYCLES.YEARLY) {
    return (this.price / 12).toFixed(2);
  }
  if (this.billingCycle === BILLING_CYCLES.QUARTERLY) {
    return (this.price / 3).toFixed(2);
  }
  return this.price;
});

// Static method: Get public plans
subscriptionPlanSchema.statics.getPublicPlans = function () {
  return this.find({ isActive: true, isPublic: true }).sort({ displayOrder: 1, price: 1 });
};

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
