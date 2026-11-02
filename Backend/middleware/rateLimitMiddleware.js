const rateLimit = require("express-rate-limit");

// Helper: return rate-limit errors as JSON so the frontend can read them
const jsonHandler = (message) => (req, res) => {
  res.status(429).json({ success: false, message });
};

// General rate limiter for all API routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Generous so active learners & page navigations are never blocked
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const url = req.originalUrl || req.url || "";
    return url.includes("/verify") || url.includes("/webhook") || url.includes("/health");
  },
  handler: jsonHandler("Too many requests. Please try again later."),
});

// Auth rate limiter — generous enough for normal sign-up / sign-in flows
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // 60 attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler("Too many authentication attempts. Please wait 15 minutes and try again."),
});

// Rate limiter for payment routes
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Never throttle status verification polling, webhooks, or read-only GET requests
    const url = req.originalUrl || req.url || "";
    return url.includes("/verify") || url.includes("/webhook") || req.method === "GET";
  },
  handler: jsonHandler("Too many payment attempts. Please wait a moment and try again."),
});

module.exports = {
  generalLimiter,
  authLimiter,
  paymentLimiter,
};
