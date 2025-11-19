const mongoose = require('mongoose');
const { UNIT_TYPES, WEIGHT_UNITS, VOLUME_UNITS, PIECE_UNITS } = require('../config/constants');

// Sub-schema for unit conversions
const unitConversionSchema = new mongoose.Schema(
  {
    unit: {
      type: String,
      required: true,
    },
    conversionFactor: {
      type: Number,
      required: true,
      min: 0,
    },
    // Example: if base unit is kg, and this is g:
    // conversionFactor = 0.001 (1g = 0.001kg)
    // if this is "cup" and 1 cup = 0.18kg:
    // conversionFactor = 0.18
  },
  { _id: false }
);

// Sub-schema for price variations by unit
const priceByUnitSchema = new mongoose.Schema(
  {
    unit: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    // Tenant isolation
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },

    // Branch (for multi-branch inventory)
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },

    // Basic Information
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },

    nameAr: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    // SKU & Barcode
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },

    barcode: {
      type: String,
      index: true,
      sparse: true,
    },

    // Category
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      index: true,
    },

    subCategory: {
      type: String,
      trim: true,
    },

    // Images
    images: [{
      url: String,
      alt: String,
      isPrimary: {
        type: Boolean,
        default: false,
      },
    }],

    // Pricing (Base Unit)
    baseUnit: {
      type: String,
      required: [true, 'Base unit is required'],
      default: 'piece',
      // Examples: kg, l, piece, pack, box
    },

    unitType: {
      type: String,
      enum: Object.values(UNIT_TYPES),
      default: UNIT_TYPES.PIECE,
    },

    // Base price per base unit
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },

    // Cost (buying price)
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Multi-Unit System
    allowedUnits: [{
      type: String,
      // Units in which this product can be sold
      // Example: ['kg', 'g', 'cup', 'pack']
    }],

    unitConversions: [unitConversionSchema],
    // Example:
    // [
    //   { unit: 'g', conversionFactor: 0.001 },
    //   { unit: 'cup', conversionFactor: 0.18 },
    //   { unit: 'pack', conversionFactor: 1 }
    // ]

    priceByUnit: [priceByUnitSchema],
    // Optional: different prices for different units
    // Example:
    // [
    //   { unit: 'kg', price: 2.5 },
    //   { unit: 'pack', price: 2.7 }
    // ]

    // Inventory
    stock: {
      quantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
      },
      unit: {
        type: String,
        default: 'piece',
      },
      minStock: {
        type: Number,
        default: 10,
      },
      maxStock: {
        type: Number,
        default: 1000,
      },
      reorderPoint: {
        type: Number,
        default: 20,
      },
    },

    // Supplier
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },

    supplierSKU: String,

    // Product Attributes
    brand: {
      type: String,
      trim: true,
    },

    manufacturer: {
      type: String,
      trim: true,
    },

    origin: {
      type: String,
      default: 'Tunisia',
    },

    // Variants (e.g., color, size)
    variants: [{
      name: String,
      value: String,
      priceModifier: {
        type: Number,
        default: 0,
      },
    }],

    // Dates
    expirationDate: Date,

    manufactureDate: Date,

    // Tax
    taxable: {
      type: Boolean,
      default: true,
    },

    taxRate: {
      type: Number,
      default: 19, // Tunisia VAT
    },

    // Discounts
    discount: {
      type: {
        type: String,
        enum: ['percentage', 'fixed'],
      },
      value: {
        type: Number,
        min: 0,
      },
      startDate: Date,
      endDate: Date,
      isActive: {
        type: Boolean,
        default: false,
      },
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    isLowStock: {
      type: Boolean,
      default: false,
    },

    isOutOfStock: {
      type: Boolean,
      default: false,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Metadata
    tags: [String],

    notes: String,

    // Analytics
    totalSold: {
      type: Number,
      default: 0,
    },

    totalRevenue: {
      type: Number,
      default: 0,
    },

    viewCount: {
      type: Number,
      default: 0,
    },

    lastSoldDate: Date,

    lastRestockDate: Date,

    // Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    updatedBy: {
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

// Indexes for performance
productSchema.index({ tenantId: 1, sku: 1 }, { unique: true });
productSchema.index({ tenantId: 1, barcode: 1 });
productSchema.index({ tenantId: 1, name: 'text', nameAr: 'text' });
productSchema.index({ tenantId: 1, category: 1 });
productSchema.index({ tenantId: 1, isActive: 1 });
productSchema.index({ branchId: 1 });

// Virtual: Profit margin
productSchema.virtual('profitMargin').get(function () {
  if (!this.cost || this.cost === 0) return 0;
  return ((this.price - this.cost) / this.cost) * 100;
});

// Virtual: Final price (after discount)
productSchema.virtual('finalPrice').get(function () {
  if (!this.discount || !this.discount.isActive) return this.price;

  if (this.discount.type === 'percentage') {
    return this.price - (this.price * this.discount.value) / 100;
  }

  return this.price - this.discount.value;
});

// Method: Convert quantity from one unit to base unit
productSchema.methods.convertToBaseUnit = function (quantity, fromUnit) {
  if (fromUnit === this.baseUnit) {
    return quantity;
  }

  const conversion = this.unitConversions.find((c) => c.unit === fromUnit);

  if (!conversion) {
    throw new Error(`No conversion found for unit: ${fromUnit}`);
  }

  return quantity * conversion.conversionFactor;
};

// Method: Convert quantity from base unit to another unit
productSchema.methods.convertFromBaseUnit = function (quantity, toUnit) {
  if (toUnit === this.baseUnit) {
    return quantity;
  }

  const conversion = this.unitConversions.find((c) => c.unit === toUnit);

  if (!conversion) {
    throw new Error(`No conversion found for unit: ${toUnit}`);
  }

  return quantity / conversion.conversionFactor;
};

// Method: Calculate price for a specific quantity and unit
productSchema.methods.calculatePrice = function (quantity, unit) {
  // Check if there's a specific price for this unit
  const priceForUnit = this.priceByUnit.find((p) => p.unit === unit);

  if (priceForUnit) {
    return priceForUnit.price * quantity;
  }

  // Convert to base unit and calculate
  const baseQuantity = this.convertToBaseUnit(quantity, unit);
  const totalPrice = baseQuantity * this.price;

  // Apply discount if active
  if (this.discount && this.discount.isActive) {
    if (this.discount.type === 'percentage') {
      return totalPrice - (totalPrice * this.discount.value) / 100;
    }
    return totalPrice - this.discount.value;
  }

  return totalPrice;
};

// Method: Check if stock is available
productSchema.methods.hasStock = function (quantity, unit) {
  const requiredQuantity = this.convertToBaseUnit(quantity, unit);
  const availableQuantity = this.stock.quantity;
  return availableQuantity >= requiredQuantity;
};

// Method: Deduct stock
productSchema.methods.deductStock = function (quantity, unit) {
  const deductAmount = this.convertToBaseUnit(quantity, unit);
  this.stock.quantity -= deductAmount;

  // Update stock status
  if (this.stock.quantity <= 0) {
    this.isOutOfStock = true;
    this.stock.quantity = 0;
  } else if (this.stock.quantity <= this.stock.minStock) {
    this.isLowStock = true;
  } else {
    this.isLowStock = false;
  }

  return this.save();
};

// Method: Add stock
productSchema.methods.addStock = function (quantity, unit) {
  const addAmount = this.convertToBaseUnit(quantity, unit);
  this.stock.quantity += addAmount;

  // Update stock status
  this.isOutOfStock = false;
  if (this.stock.quantity > this.stock.minStock) {
    this.isLowStock = false;
  }

  this.lastRestockDate = new Date();

  return this.save();
};

// Pre-save middleware: Update stock status
productSchema.pre('save', function (next) {
  if (this.isModified('stock.quantity')) {
    if (this.stock.quantity <= 0) {
      this.isOutOfStock = true;
      this.isLowStock = false;
    } else if (this.stock.quantity <= this.stock.minStock) {
      this.isLowStock = true;
      this.isOutOfStock = false;
    } else {
      this.isLowStock = false;
      this.isOutOfStock = false;
    }
  }
  next();
});

// Static method: Low stock products
productSchema.statics.getLowStockProducts = function (tenantId) {
  return this.find({
    tenantId,
    isLowStock: true,
    isActive: true,
  }).sort({ 'stock.quantity': 1 });
};

// Static method: Out of stock products
productSchema.statics.getOutOfStockProducts = function (tenantId) {
  return this.find({
    tenantId,
    isOutOfStock: true,
    isActive: true,
  });
};

module.exports = mongoose.model('Product', productSchema);
