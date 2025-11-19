const Product = require('../models/Product.model');
const Category = require('../models/Category.model');
const { AppError } = require('../middleware/errorHandler');
const { successResponse, paginatedResponse } = require('../utils/response');

// Get all products
exports.getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category, isActive } = req.query;
    const tenantId = req.tenantId;

    let query = { tenantId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nameAr: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('supplier', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Product.countDocuments(query);

    paginatedResponse(res, products, page, limit, count);
  } catch (error) {
    next(error);
  }
};

// Get single product
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    })
      .populate('category')
      .populate('supplier');

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    successResponse(res, 200, 'Product retrieved successfully', { product });
  } catch (error) {
    next(error);
  }
};

// Create product
exports.createProduct = async (req, res, next) => {
  try {
    const productData = {
      ...req.body,
      tenantId: req.tenantId,
      branchId: req.user.branchId,
      createdBy: req.user.id,
    };

    const product = await Product.create(productData);

    successResponse(res, 201, 'Product created successfully', { product });
  } catch (error) {
    next(error);
  }
};

// Update product
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    Object.assign(product, req.body);
    product.updatedBy = req.user.id;
    await product.save();

    successResponse(res, 200, 'Product updated successfully', { product });
  } catch (error) {
    next(error);
  }
};

// Delete product
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId,
    });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    successResponse(res, 200, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Get low stock products
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.getLowStockProducts(req.tenantId);

    successResponse(res, 200, 'Low stock products retrieved', { products });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
