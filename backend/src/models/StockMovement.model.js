const mongoose = require('mongoose');
const { STOCK_MOVEMENT_TYPES } = require('../config/constants');

const stockMovementSchema = new mongoose.Schema(
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

    // Product
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },

    productName: String,
    sku: String,

    // Movement Type
    type: {
      type: String,
      enum: Object.values(STOCK_MOVEMENT_TYPES),
      required: true,
    },

    // Quantity
    quantity: {
      type: Number,
      required: true,
    },

    unit: {
      type: String,
      required: true,
    },

    // Stock levels before and after
    stockBefore: {
      type: Number,
      required: true,
    },

    stockAfter: {
      type: Number,
      required: true,
    },

    // Related documents
    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale',
    },

    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
    },

    // Transfer (for branch transfers)
    fromBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },

    toBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },

    // Cost (for purchase)
    unitCost: {
      type: Number,
      default: 0,
    },

    totalCost: {
      type: Number,
      default: 0,
    },

    // Reason
    reason: {
      type: String,
      enum: [
        'sale',
        'purchase',
        'return',
        'adjustment',
        'transfer',
        'damage',
        'expiry',
        'theft',
        'loss',
        'found',
        'correction',
        'other',
      ],
    },

    notes: String,

    // Date
    movementDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // User who made the movement
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Metadata
    reference: String,
    batchNumber: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
stockMovementSchema.index({ tenantId: 1, product: 1, movementDate: -1 });
stockMovementSchema.index({ tenantId: 1, type: 1 });
stockMovementSchema.index({ branchId: 1, movementDate: -1 });

// Static method: Get movements for product
stockMovementSchema.statics.getProductMovements = function (productId, tenantId, limit = 50) {
  return this.find({ product: productId, tenantId })
    .sort({ movementDate: -1 })
    .limit(limit)
    .populate('createdBy', 'firstName lastName');
};

// Static method: Get movements by date range
stockMovementSchema.statics.getMovementsByDateRange = function (tenantId, startDate, endDate) {
  return this.find({
    tenantId,
    movementDate: { $gte: startDate, $lte: endDate },
  }).sort({ movementDate: -1 });
};

module.exports = mongoose.model('StockMovement', stockMovementSchema);
