const Customer = require('../models/Customer.model');
const { AppError } = require('../middleware/errorHandler');
const { successResponse, paginatedResponse } = require('../utils/response');

exports.getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    let query = { tenantId: req.tenantId };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Customer.countDocuments(query);

    paginatedResponse(res, customers, page, limit, count);
  } catch (error) {
    next(error);
  }
};

exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, tenantId: req.tenantId });

    if (!customer) {
      return next(new AppError('Customer not found', 404));
    }

    successResponse(res, 200, 'Customer retrieved successfully', { customer });
  } catch (error) {
    next(error);
  }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create({
      ...req.body,
      tenantId: req.tenantId,
      createdBy: req.user.id,
    });

    successResponse(res, 201, 'Customer created successfully', { customer });
  } catch (error) {
    next(error);
  }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return next(new AppError('Customer not found', 404));
    }

    successResponse(res, 200, 'Customer updated successfully', { customer });
  } catch (error) {
    next(error);
  }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });

    if (!customer) {
      return next(new AppError('Customer not found', 404));
    }

    successResponse(res, 200, 'Customer deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
