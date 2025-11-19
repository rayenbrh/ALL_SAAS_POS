const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    // Tenant isolation
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },

    // Supplier Information
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
    },

    code: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },

    companyName: {
      type: String,
      trim: true,
    },

    // Contact
    contactPerson: {
      firstName: String,
      lastName: String,
      position: String,
      phone: String,
      email: {
        type: String,
        lowercase: true,
      },
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    alternatePhone: String,

    website: String,

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

    // Business Information
    taxId: String,
    vatNumber: String,
    registrationNumber: String,

    // Payment Terms
    paymentTerms: {
      type: String,
      enum: ['cash', 'net15', 'net30', 'net60', 'net90'],
      default: 'cash',
    },

    creditLimit: {
      type: Number,
      default: 0,
    },

    currentDebt: {
      type: Number,
      default: 0,
    },

    // Banking
    bankDetails: {
      bankName: String,
      accountNumber: String,
      iban: String,
      swiftCode: String,
    },

    // Products supplied
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],

    // Categories
    categories: [String],

    // Statistics
    stats: {
      totalOrders: {
        type: Number,
        default: 0,
      },
      totalSpent: {
        type: Number,
        default: 0,
      },
      lastOrderDate: Date,
      firstOrderDate: Date,
      averageOrderValue: {
        type: Number,
        default: 0,
      },
    },

    // Rating
    rating: {
      quality: {
        type: Number,
        min: 1,
        max: 5,
      },
      delivery: {
        type: Number,
        min: 1,
        max: 5,
      },
      pricing: {
        type: Number,
        min: 1,
        max: 5,
      },
      overall: {
        type: Number,
        min: 1,
        max: 5,
      },
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    isPriority: {
      type: Boolean,
      default: false,
    },

    // Notes
    notes: String,

    // Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
supplierSchema.index({ tenantId: 1, code: 1 }, { unique: true });
supplierSchema.index({ tenantId: 1, name: 1 });
supplierSchema.index({ tenantId: 1, isActive: 1 });

// Pre-save: Generate supplier code
supplierSchema.pre('save', async function (next) {
  if (this.isNew && !this.code) {
    const count = await this.constructor.countDocuments({ tenantId: this.tenantId });
    this.code = `SUP${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Method: Update order stats
supplierSchema.methods.updateOrderStats = function (orderAmount) {
  this.stats.totalOrders += 1;
  this.stats.totalSpent += orderAmount;
  this.stats.averageOrderValue = this.stats.totalSpent / this.stats.totalOrders;
  this.stats.lastOrderDate = new Date();

  if (!this.stats.firstOrderDate) {
    this.stats.firstOrderDate = new Date();
  }

  return this.save();
};

module.exports = mongoose.model('Supplier', supplierSchema);
