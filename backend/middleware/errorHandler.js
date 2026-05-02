function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || error.status || 500;
  let message = error.message || 'Internal server error';

  if (error.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'A record with this unique value already exists';
  }

  if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_ROW_IS_REFERENCED_2') {
    statusCode = 400;
    message = 'Invalid relationship: referenced record is missing or still in use';
  }

  if (error.code === 'WARN_DATA_TRUNCATED' || error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
    statusCode = 400;
    message = 'Invalid value for one or more fields';
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error(error);
  }

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
}

module.exports = { notFound, errorHandler };
