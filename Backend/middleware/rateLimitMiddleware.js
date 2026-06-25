const rateLimit = require("express-rate-limit");

// Helper: return rate-limit errors as JSON so the frontend can read them
const jsonHandler = (message) => (req, res) => {
  res.status(429).json({ success: false, message });
};

// General rate limiter for all API routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler("Too many requests. Please try again later."),
});

// Auth rate limiter — generous enough for normal sign-up / sign-in flows
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler("Too many authentication attempts. Please wait 15 minutes and try again."),
});

// Rate limiter for payment routes
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler("Too many payment attempts. Please try again later."),
});

module.exports = {
  generalLimiter,
  authLimiter,
  paymentLimiter,
};
