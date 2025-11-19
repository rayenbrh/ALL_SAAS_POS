const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    // Tenant isolation
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },

    // Customer Number
    customerNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Basic Information
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

    // Contact
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      index: true,
    },

    alternatePhone: String,

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

    // Customer Type
    type: {
      type: String,
      enum: ['retail', 'wholesale', 'vip'],
      default: 'retail',
    },

    // Loyalty Program
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    loyaltyTier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
    },

    // Credit Management
    creditLimit: {
      type: Number,
      default: 0,
      min: 0,
    },

    currentCredit: {
      type: Number,
      default: 0,
      min: 0,
    },

    allowCredit: {
      type: Boolean,
      default: false,
    },

    // Purchase History
    totalPurchases: {
      type: Number,
      default: 0,
    },

    totalSpent: {
      type: Number,
      default: 0,
    },

    averageOrderValue: {
      type: Number,
      default: 0,
    },

    lastPurchaseDate: Date,

    firstPurchaseDate: Date,

    purchaseCount: {
      type: Number,
      default: 0,
    },

    // Preferences
    preferredPaymentMethod: {
      type: String,
      enum: ['cash', 'card', 'd17', 'flouci', 'edinar', 'credit'],
    },

    preferredLanguage: {
      type: String,
      enum: ['ar', 'fr', 'en'],
      default: 'fr',
    },

    // Marketing
    emailConsent: {
      type: Boolean,
      default: false,
    },

    smsConsent: {
      type: Boolean,
      default: false,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    isBlacklisted: {
      type: Boolean,
      default: false,
    },

    blacklistReason: String,

    // Birthday (for promotions)
    birthday: Date,

    // Tax Information (for wholesale)
    taxId: String,

    // Notes
    notes: String,

    // Tags
    tags: [String],

    // Metadata
    source: {
      type: String,
      enum: ['walk-in', 'referral', 'online', 'marketing', 'other'],
      default: 'walk-in',
    },

    // Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
customerSchema.index({ tenantId: 1, customerNumber: 1 }, { unique: true });
customerSchema.index({ tenantId: 1, phone: 1 });
customerSchema.index({ tenantId: 1, email: 1 });
customerSchema.index({ tenantId: 1, isActive: 1 });

// Virtual: Full name
customerSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual: Available credit
customerSchema.virtual('availableCredit').get(function () {
  return this.creditLimit - this.currentCredit;
});

// Pre-save: Generate customer number
customerSchema.pre('save', async function (next) {
  if (this.isNew && !this.customerNumber) {
    const count = await this.constructor.countDocuments({ tenantId: this.tenantId });
    this.customerNumber = `CUST${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

// Method: Update purchase stats
customerSchema.methods.updatePurchaseStats = function (saleAmount) {
  this.purchaseCount += 1;
  this.totalSpent += saleAmount;
  this.totalPurchases = this.purchaseCount;
  this.averageOrderValue = this.totalSpent / this.purchaseCount;
  this.lastPurchaseDate = new Date();

  if (!this.firstPurchaseDate) {
    this.firstPurchaseDate = new Date();
  }

  return this.save();
};

// Method: Add loyalty points
customerSchema.methods.addLoyaltyPoints = function (points) {
  this.loyaltyPoints += points;

  // Update tier based on points
  if (this.loyaltyPoints >= 10000) {
    this.loyaltyTier = 'platinum';
  } else if (this.loyaltyPoints >= 5000) {
    this.loyaltyTier = 'gold';
  } else if (this.loyaltyPoints >= 2000) {
    this.loyaltyTier = 'silver';
  } else {
    this.loyaltyTier = 'bronze';
  }

  return this.save();
};

// Method: Add credit debt
customerSchema.methods.addCredit = function (amount) {
  if (!this.allowCredit) {
    throw new Error('Credit not allowed for this customer');
  }

  if (this.currentCredit + amount > this.creditLimit) {
    throw new Error('Credit limit exceeded');
  }

  this.currentCredit += amount;
  return this.save();
};

// Method: Pay credit
customerSchema.methods.payCredit = function (amount) {
  this.currentCredit = Math.max(0, this.currentCredit - amount);
  return this.save();
};

module.exports = mongoose.model('Customer', customerSchema);
