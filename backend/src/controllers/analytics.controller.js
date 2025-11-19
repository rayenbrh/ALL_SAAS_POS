const Sale = require('../models/Sale.model');
const Product = require('../models/Product.model');
const { successResponse } = require('../utils/response');

exports.getSalesAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {
      tenantId: req.tenantId,
      status: 'completed',
      saleDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    const sales = await Sale.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
          totalRevenue: { $sum: '$total' },
          totalSales: { $sum: 1 },
          totalDiscount: { $sum: '$discountAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    successResponse(res, 200, 'Analytics retrieved', { sales });
  } catch (error) {
    next(error);
  }
};

exports.getProductPerformance = async (req, res, next) => {
  try {
    const products = await Product.find({ tenantId: req.tenantId })
      .select('name sku totalSold totalRevenue')
      .sort({ totalSold: -1 })
      .limit(10);

    successResponse(res, 200, 'Product performance retrieved', { products });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
