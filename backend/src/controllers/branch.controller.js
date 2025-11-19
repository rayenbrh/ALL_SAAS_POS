const Branch = require('../models/Branch.model');
const { AppError } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/response');

exports.getBranches = async (req, res, next) => {
  try {
    const branches = await Branch.find({ tenantId: req.tenantId })
      .populate('manager', 'firstName lastName')
      .sort({ createdAt: -1 });

    successResponse(res, 200, 'Branches retrieved successfully', { branches });
  } catch (error) {
    next(error);
  }
};

exports.createBranch = async (req, res, next) => {
  try {
    const branch = await Branch.create({
      ...req.body,
      tenantId: req.tenantId,
      createdBy: req.user.id,
    });

    successResponse(res, 201, 'Branch created successfully', { branch });
  } catch (error) {
    next(error);
  }
};

exports.updateBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!branch) {
      return next(new AppError('Branch not found', 404));
    }

    successResponse(res, 200, 'Branch updated successfully', { branch });
  } catch (error) {
    next(error);
  }
};

exports.deleteBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });

    if (!branch) {
      return next(new AppError('Branch not found', 404));
    }

    successResponse(res, 200, 'Branch deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
