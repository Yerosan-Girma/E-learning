const ApiError = require("../utils/ApiError");

function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  // Enhanced error logging
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message,
    userId: req.user?.id || null,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    stack: err.stack,
  };

  // Log to console with appropriate level
  if (statusCode >= 500) {
    console.error('[ERROR]', JSON.stringify(errorLog));
  } else if (statusCode >= 400) {
    console.warn('[WARN]', JSON.stringify(errorLog));
  } else {
    console.log('[INFO]', JSON.stringify(errorLog));
  }

  // Log specific security events
  if (statusCode === 401 || statusCode === 403) {
    console.error('[SECURITY]', JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'Unauthorized access attempt',
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.id || null,
      ip: req.ip || req.connection.remoteAddress,
      message: err.message,
    }));
  }

  // Log payment failures
  if (req.originalUrl.includes('/payments') && statusCode >= 400) {
    console.error('[PAYMENT]', JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'Payment processing error',
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.id || null,
      message: err.message,
    }));
  }

  return res.status(statusCode).json({
    success: false,
    message,
    details: err.details || null,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
}

module.exports = {
  notFound,
  errorHandler,
};
