const Sale = require('../models/Sale.model');
const Product = require('../models/Product.model');
const Customer = require('../models/Customer.model');
const StockMovement = require('../models/StockMovement.model');
const { AppError } = require('../middleware/errorHandler');
const { successResponse, paginatedResponse } = require('../utils/response');
const { TRANSACTION_TYPES, STOCK_MOVEMENT_TYPES } = require('../config/constants');

/**
 * @desc    Create new sale
 * @route   POST /api/pos/sale
 * @access  Private
 */
exports.createSale = async (req, res, next) => {
  try {
    const { items, customer, payments, discount, notes } = req.body;
    const tenantId = req.tenantId;
    const cashierId = req.user.id;

    // Validate items
    if (!items || items.length === 0) {
      return next(new AppError('No items in cart', 400));
    }

    // Process each item and check stock
    const processedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId,
        tenantId,
        isActive: true,
      });

      if (!product) {
        return next(new AppError(`Product ${item.productId} not found`, 404));
      }

      // Check stock availability
      if (!product.hasStock(item.quantity, item.unit)) {
        return next(new AppError(`Insufficient stock for ${product.name}`, 400));
      }

      // Calculate price for this item
      const unitPrice = product.calculatePrice(1, item.unit);
      const itemSubtotal = unitPrice * item.quantity;

      processedItems.push({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice,
        tax: product.taxRate,
        taxAmount: (itemSubtotal * product.taxRate) / 100,
        subtotal: itemSubtotal,
        total: itemSubtotal + (itemSubtotal * product.taxRate) / 100,
        notes: item.notes,
      });

      subtotal += itemSubtotal;
    }

    // Calculate totals
    let discountAmount = 0;
    if (discount && discount.value > 0) {
      if (discount.type === 'percentage') {
        discountAmount = (subtotal * discount.value) / 100;
      } else {
        discountAmount = discount.value;
      }
    }

    const taxAmount = processedItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const total = subtotal - discountAmount + taxAmount;

    // Calculate amount paid
    const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    // Create sale
    const sale = await Sale.create({
      tenantId,
      branchId: req.user.branchId,
      items: processedItems,
      customer: customer || null,
      cashier: cashierId,
      cashierName: req.user.fullName,
      subtotal,
      discount,
      discountAmount,
      taxAmount,
      total,
      payments,
      amountPaid,
      change: amountPaid - total,
      paymentStatus: amountPaid >= total ? 'completed' : 'pending',
      creditAmount: amountPaid < total ? total - amountPaid : 0,
      status: 'completed',
      notes,
      saleDate: new Date(),
      createdBy: cashierId,
    });

    // Deduct stock and create stock movements
    for (const item of items) {
      const product = await Product.findById(item.productId);

      // Deduct stock
      await product.deductStock(item.quantity, item.unit);

      // Update product analytics
      product.totalSold += item.quantity;
      product.lastSoldDate = new Date();
      await product.save();

      // Create stock movement
      await StockMovement.create({
        tenantId,
        branchId: req.user.branchId,
        product: product._id,
        productName: product.name,
        sku: product.sku,
        type: STOCK_MOVEMENT_TYPES.SALE,
        quantity: -item.quantity,
        unit: item.unit,
        stockBefore: product.stock.quantity + product.convertToBaseUnit(item.quantity, item.unit),
        stockAfter: product.stock.quantity,
        sale: sale._id,
        reason: 'sale',
        movementDate: new Date(),
        createdBy: cashierId,
      });
    }

    // Update customer purchase history
    if (customer) {
      const customerDoc = await Customer.findById(customer);
      if (customerDoc) {
        await customerDoc.updatePurchaseStats(total);

        // Add loyalty points (1 point per TND)
        await customerDoc.addLoyaltyPoints(Math.floor(total));

        // Add credit if payment is incomplete
        if (amountPaid < total && customerDoc.allowCredit) {
          await customerDoc.addCredit(total - amountPaid);
        }
      }
    }

    // Populate and return
    await sale.populate('customer', 'firstName lastName phone');

    successResponse(res, 201, 'Sale completed successfully', { sale });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get product search for POS
 * @route   GET /api/pos/products/search
 * @access  Private
 */
exports.searchProducts = async (req, res, next) => {
  try {
    const { q, barcode } = req.query;
    const tenantId = req.tenantId;

    let query = { tenantId, isActive: true };

    if (barcode) {
      query.barcode = barcode;
    } else if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { nameAr: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } },
      ];
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .limit(20)
      .lean();

    successResponse(res, 200, 'Products retrieved successfully', { products });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Hold current order
 * @route   POST /api/pos/hold-order
 * @access  Private
 */
exports.holdOrder = async (req, res, next) => {
  try {
    const { items, customer, notes } = req.body;

    const sale = await Sale.create({
      tenantId: req.tenantId,
      branchId: req.user.branchId,
      items,
      customer,
      cashier: req.user.id,
      cashierName: req.user.fullName,
      isHeld: true,
      heldAt: new Date(),
      status: 'pending',
      notes,
      createdBy: req.user.id,
    });

    successResponse(res, 201, 'Order held successfully', { sale });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get held orders
 * @route   GET /api/pos/held-orders
 * @access  Private
 */
exports.getHeldOrders = async (req, res, next) => {
  try {
    const sales = await Sale.find({
      tenantId: req.tenantId,
      isHeld: true,
      status: 'pending',
    })
      .populate('customer', 'firstName lastName')
      .sort({ heldAt: -1 });

    successResponse(res, 200, 'Held orders retrieved successfully', { sales });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Retrieve held order
 * @route   POST /api/pos/retrieve-order/:id
 * @access  Private
 */
exports.retrieveHeldOrder = async (req, res, next) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
      isHeld: true,
    }).populate('items.product');

    if (!sale) {
      return next(new AppError('Held order not found', 404));
    }

    sale.isHeld = false;
    sale.retrievedAt = new Date();
    await sale.save();

    successResponse(res, 200, 'Order retrieved successfully', { sale });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get daily summary
 * @route   GET /api/pos/daily-summary
 * @access  Private
 */
exports.getDailySummary = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await Sale.find({
      tenantId,
      saleDate: { $gte: startOfDay, $lte: endOfDay },
      status: 'completed',
    });

    const summary = {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, s) => sum + s.total, 0),
      totalDiscount: sales.reduce((sum, s) => sum + s.discountAmount, 0),
      totalTax: sales.reduce((sum, s) => sum + s.taxAmount, 0),
      cashSales: sales.filter(s => s.payments.some(p => p.method === 'cash')).length,
      cardSales: sales.filter(s => s.payments.some(p => p.method === 'card')).length,
    };

    successResponse(res, 200, 'Daily summary retrieved successfully', { summary });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
