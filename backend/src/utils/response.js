/**
 * Standard success response
 */
const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Standard error response
 */
const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    error: message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Paginated response
 */
const paginatedResponse = (res, data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    data,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      pageSize: parseInt(limit),
      totalItems: total,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};
