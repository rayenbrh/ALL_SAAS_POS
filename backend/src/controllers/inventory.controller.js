const Product = require('../models/Product.model');
const StockMovement = require('../models/StockMovement.model');
const { AppError } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/response');
const { STOCK_MOVEMENT_TYPES } = require('../config/constants');

// Stock in
exports.stockIn = async (req, res, next) => {
  try {
    const { productId, quantity, unit, unitCost, notes, reference } = req.body;

    const product = await Product.findOne({ _id: productId, tenantId: req.tenantId });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    const stockBefore = product.stock.quantity;

    await product.addStock(quantity, unit);

    await StockMovement.create({
      tenantId: req.tenantId,
      product: productId,
      productName: product.name,
      sku: product.sku,
      type: STOCK_MOVEMENT_TYPES.PURCHASE,
      quantity,
      unit,
      stockBefore,
      stockAfter: product.stock.quantity,
      unitCost,
      totalCost: unitCost * quantity,
      reason: 'purchase',
      notes,
      reference,
      movementDate: new Date(),
      createdBy: req.user.id,
    });

    successResponse(res, 200, 'Stock added successfully', { product });
  } catch (error) {
    next(error);
  }
};

// Stock out
exports.stockOut = async (req, res, next) => {
  try {
    const { productId, quantity, unit, reason, notes } = req.body;

    const product = await Product.findOne({ _id: productId, tenantId: req.tenantId });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    if (!product.hasStock(quantity, unit)) {
      return next(new AppError('Insufficient stock', 400));
    }

    const stockBefore = product.stock.quantity;

    await product.deductStock(quantity, unit);

    await StockMovement.create({
      tenantId: req.tenantId,
      product: productId,
      productName: product.name,
      sku: product.sku,
      type: STOCK_MOVEMENT_TYPES.ADJUSTMENT,
      quantity: -quantity,
      unit,
      stockBefore,
      stockAfter: product.stock.quantity,
      reason: reason || 'adjustment',
      notes,
      movementDate: new Date(),
      createdBy: req.user.id,
    });

    successResponse(res, 200, 'Stock deducted successfully', { product });
  } catch (error) {
    next(error);
  }
};

// Get stock movements
exports.getStockMovements = async (req, res, next) => {
  try {
    const { productId, startDate, endDate } = req.query;

    let query = { tenantId: req.tenantId };

    if (productId) query.product = productId;

    if (startDate && endDate) {
      query.movementDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const movements = await StockMovement.find(query)
      .populate('product', 'name sku')
      .populate('createdBy', 'firstName lastName')
      .sort({ movementDate: -1 })
      .limit(100);

    successResponse(res, 200, 'Stock movements retrieved', { movements });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
