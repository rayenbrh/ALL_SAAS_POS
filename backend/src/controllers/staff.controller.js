const User = require('../models/User.model');
const { AppError } = require('../middleware/errorHandler');
const { successResponse, paginatedResponse } = require('../utils/response');

exports.getStaff = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const staff = await User.find({ tenantId: req.tenantId, role: { $ne: 'super_admin' } })
      .select('-password -refreshToken')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments({ tenantId: req.tenantId });

    paginatedResponse(res, staff, page, limit, count);
  } catch (error) {
    next(error);
  }
};

exports.createStaff = async (req, res, next) => {
  try {
    const user = await User.create({
      ...req.body,
      tenantId: req.tenantId,
      isActive: true,
    });

    successResponse(res, 201, 'Staff member created successfully', { user });
  } catch (error) {
    next(error);
  }
};

exports.updateStaff = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      return next(new AppError('Staff member not found', 404));
    }

    successResponse(res, 200, 'Staff member updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

exports.deleteStaff = async (req, res, next) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });

    if (!user) {
      return next(new AppError('Staff member not found', 404));
    }

    successResponse(res, 200, 'Staff member deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
