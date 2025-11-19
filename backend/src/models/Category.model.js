const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, 'Category name is required'],
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

    slug: {
      type: String,
      lowercase: true,
    },

    // Parent category for hierarchical structure
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },

    // Icon or color for UI
    icon: String,
    color: String,

    // Display order
    order: {
      type: Number,
      default: 0,
    },

    // Image
    image: String,

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Metadata
    productsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index
categorySchema.index({ tenantId: 1, name: 1 });
categorySchema.index({ tenantId: 1, slug: 1 });

// Virtual: Subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

module.exports = mongoose.model('Category', categorySchema);
