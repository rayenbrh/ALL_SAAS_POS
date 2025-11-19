const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    // Tenant isolation
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },

    // Branch Information
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
    },

    code: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },

    description: String,

    // Contact
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    // Address
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: String,
      governorate: {
        type: String,
        required: true,
      },
      postalCode: String,
      country: {
        type: String,
        default: 'Tunisia',
      },
    },

    // Coordinates for map
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },

    // Branch Manager
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Staff assigned to this branch
    staff: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],

    // Operating Hours
    operatingHours: {
      monday: { open: String, close: String, isClosed: Boolean },
      tuesday: { open: String, close: String, isClosed: Boolean },
      wednesday: { open: String, close: String, isClosed: Boolean },
      thursday: { open: String, close: String, isClosed: Boolean },
      friday: { open: String, close: String, isClosed: Boolean },
      saturday: { open: String, close: String, isClosed: Boolean },
      sunday: { open: String, close: String, isClosed: Boolean },
    },

    // Settings
    settings: {
      currency: {
        type: String,
        default: 'TND',
      },
      taxRate: {
        type: Number,
        default: 19,
      },
      receiptPrefix: String,
      allowNegativeStock: {
        type: Boolean,
        default: false,
      },
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    isMainBranch: {
      type: Boolean,
      default: false,
    },

    // Analytics
    stats: {
      totalSales: {
        type: Number,
        default: 0,
      },
      totalRevenue: {
        type: Number,
        default: 0,
      },
      productsCount: {
        type: Number,
        default: 0,
      },
      staffCount: {
        type: Number,
        default: 0,
      },
      customersCount: {
        type: Number,
        default: 0,
      },
    },

    // Metadata
    openedDate: Date,

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
branchSchema.index({ tenantId: 1, code: 1 }, { unique: true });
branchSchema.index({ tenantId: 1, isActive: 1 });
branchSchema.index({ location: '2dsphere' });

// Pre-save: Generate branch code
branchSchema.pre('save', async function (next) {
  if (this.isNew && !this.code) {
    const count = await this.constructor.countDocuments({ tenantId: this.tenantId });
    this.code = `BR${(count + 1).toString().padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Branch', branchSchema);
