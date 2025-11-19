const Sale = require('../models/Sale.model');
const { successResponse, paginatedResponse } = require('../utils/response');

exports.getSales = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, startDate, endDate, status } = req.query;

    let query = { tenantId: req.tenantId };

    if (startDate && endDate) {
      query.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (status) query.status = status;

    const sales = await Sale.find(query)
      .populate('customer', 'firstName lastName phone')
      .populate('cashier', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ saleDate: -1 });

    const count = await Sale.countDocuments(query);

    paginatedResponse(res, sales, page, limit, count);
  } catch (error) {
    next(error);
  }
};

exports.getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findOne({ _id: req.params.id, tenantId: req.tenantId })
      .populate('customer')
      .populate('cashier')
      .populate('items.product');

    if (!sale) {
      return next(new AppError('Sale not found', 404));
    }

    successResponse(res, 200, 'Sale retrieved successfully', { sale });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
