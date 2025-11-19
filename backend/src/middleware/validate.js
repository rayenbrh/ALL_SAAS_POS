const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

/**
 * Middleware to handle validation errors from express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));

    return next(
      new AppError(
        `Validation failed: ${errorMessages.map((e) => e.message).join(', ')}`,
        400
      )
    );
  }

  next();
};

module.exports = validate;
