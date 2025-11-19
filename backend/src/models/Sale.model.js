const mongoose = require('mongoose');
const { TRANSACTION_TYPES, PAYMENT_METHODS, PAYMENT_STATUS } = require('../config/constants');

// Sub-schema for sale items
const saleItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: String, // Store name for historical purposes
    sku: String,

    // Multi-unit support
    quantity: {
      type: Number,
      required: true,
      min: 0.001,
    },
    unit: {
      type: String,
      required: true,
    },

    // Pricing
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // Discount on this specific item
    discount: {
      type: {
        type: String,
        enum: ['percentage', 'fixed'],
      },
      value: {
        type: Number,
        default: 0,
      },
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    // Tax
    tax: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },

    // Total for this item
    subtotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },

    // Metadata
    notes: String,
  },
  { _id: true }
);

// Sub-schema for payments (multi-payment support)
const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    reference: String, // Transaction reference number
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.COMPLETED,
    },
  },
  { _id: true }
);

const saleSchema = new mongoose.Schema(
  {
    // Tenant isolation
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },

    // Branch
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },

    // Sale Number (unique per tenant)
    saleNumber: {
      type: String,
      required: true,
      index: true,
    },

    // Receipt Number (for printing)
    receiptNumber: {
      type: String,
      index: true,
    },

    // Transaction Type
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES),
      default: TRANSACTION_TYPES.SALE,
    },

    // Items
    items: [saleItemSchema],

    // Customer
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },

    customerName: String,

    // Cashier/Staff
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    cashierName: String,

    // Pricing
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },

    // Discount on entire sale
    discount: {
      type: {
        type: String,
        enum: ['percentage', 'fixed'],
      },
      value: {
        type: Number,
        default: 0,
      },
      reason: String,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    // Tax
    taxAmount: {
      type: Number,
      default: 0,
    },

    // Total
    total: {
      type: Number,
      required: true,
    },

    // Payments (multi-payment support)
    payments: [paymentSchema],

    amountPaid: {
      type: Number,
      required: true,
      default: 0,
    },

    change: {
      type: Number,
      default: 0,
    },

    // Payment status
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.COMPLETED,
    },

    // Credit sale
    creditAmount: {
      type: Number,
      default: 0,
    },

    creditDueDate: Date,

    // Status
    status: {
      type: String,
      enum: ['completed', 'pending', 'cancelled', 'refunded'],
      default: 'completed',
    },

    // Metadata
    notes: String,

    // Date & Time
    saleDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Refund related (if type is return)
    originalSale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale',
    },

    refundReason: String,

    // Hold/Park sale
    isHeld: {
      type: Boolean,
      default: false,
    },

    heldAt: Date,
    retrievedAt: Date,

    // Analytics
    profitAmount: {
      type: Number,
      default: 0,
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

// Compound indexes for performance
saleSchema.index({ tenantId: 1, saleNumber: 1 }, { unique: true });
saleSchema.index({ tenantId: 1, saleDate: -1 });
saleSchema.index({ tenantId: 1, customer: 1 });
saleSchema.index({ tenantId: 1, cashier: 1 });
saleSchema.index({ tenantId: 1, status: 1 });
saleSchema.index({ branchId: 1, saleDate: -1 });

// Virtual: Number of items
saleSchema.virtual('itemCount').get(function () {
  return this.items.length;
});

// Virtual: Total quantity
saleSchema.virtual('totalQuantity').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Method: Calculate totals
saleSchema.methods.calculateTotals = function () {
  // Calculate subtotal from items
  this.subtotal = this.items.reduce((sum, item) => {
    item.subtotal = item.quantity * item.unitPrice;

    // Apply item discount
    if (item.discount && item.discount.value > 0) {
      if (item.discount.type === 'percentage') {
        item.discountAmount = (item.subtotal * item.discount.value) / 100;
      } else {
        item.discountAmount = item.discount.value;
      }
      item.subtotal -= item.discountAmount;
    }

    // Calculate tax
    if (item.tax > 0) {
      item.taxAmount = (item.subtotal * item.tax) / 100;
    }

    item.total = item.subtotal + item.taxAmount;

    return sum + item.subtotal;
  }, 0);

  // Apply sale-level discount
  if (this.discount && this.discount.value > 0) {
    if (this.discount.type === 'percentage') {
      this.discountAmount = (this.subtotal * this.discount.value) / 100;
    } else {
      this.discountAmount = this.discount.value;
    }
  }

  // Calculate tax
  this.taxAmount = this.items.reduce((sum, item) => sum + item.taxAmount, 0);

  // Calculate total
  this.total = this.subtotal - this.discountAmount + this.taxAmount;

  // Calculate change
  this.change = this.amountPaid - this.total;

  // Credit amount
  if (this.amountPaid < this.total) {
    this.creditAmount = this.total - this.amountPaid;
  }

  return this;
};

// Pre-save middleware
saleSchema.pre('save', function (next) {
  // Generate sale number if new
  if (this.isNew && !this.saleNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.saleNumber = `SL${year}${month}${random}`;
    this.receiptNumber = this.saleNumber;
  }

  next();
});

// Static method: Get sales for date range
saleSchema.statics.getSalesByDateRange = function (tenantId, startDate, endDate) {
  return this.find({
    tenantId,
    saleDate: { $gte: startDate, $lte: endDate },
    status: 'completed',
  }).sort({ saleDate: -1 });
};

// Static method: Get today's sales
saleSchema.statics.getTodaySales = function (tenantId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return this.getSalesByDateRange(tenantId, startOfDay, endOfDay);
};

module.exports = mongoose.model('Sale', saleSchema);
