const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validateMiddleware");
const passport = require("../config/passport");

const router = express.Router();

router.post(
  "/register",
  [
    body("fullName").trim().notEmpty().withMessage("fullName is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role")
      .optional()
      .isIn(["student", "teacher"])
      .withMessage("Invalid role"),
  ],
  validate,
  authController.register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  authController.login
);

router.get("/me", protect, authController.getProfile);
router.post("/logout", protect, authController.logout);

router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Valid email is required")],
  validate,
  authController.forgotPassword
);

router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validate,
  authController.resetPassword
);

router.post(
  "/verify-email",
  [body("token").notEmpty().withMessage("Verification token is required")],
  validate,
  authController.verifyEmail
);

router.post(
  "/resend-verification",
  [body("email").isEmail().withMessage("Valid email is required")],
  validate,
  authController.resendVerification
);

// Helper to determine primary frontend URL for redirects
const getFrontendUrl = (req) => {
  const originEnv = process.env.CORS_ORIGIN || "http://localhost:5173";
  const origins = originEnv
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  const isProduction =
    process.env.NODE_ENV === "production" ||
    (req && !req.get("host")?.includes("localhost") && !req.get("host")?.includes("127.0.0.1"));

  if (isProduction) {
    const prodOrigin = origins.find(
      (o) => !o.includes("localhost") && !o.includes("127.0.0.1")
    );
    if (prodOrigin) return prodOrigin;
  }

  return origins[0] || "http://localhost:5173";
};

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  router.get(
    "/google/callback",
    (req, res, next) => {
      passport.authenticate("google", {
        failureRedirect: `${getFrontendUrl(req)}/login?error=google_auth_failed`,
      })(req, res, next);
    },
    (req, res) => {
      // Successful authentication, generate JWT token
      const { signToken } = require("../utils/jwt");
      const token = signToken({
        id: req.user.id,
        role: req.user.role,
        email: req.user.email,
        full_name: req.user.full_name,
      });

      // Redirect to frontend callback handler with token
      res.redirect(`${getFrontendUrl(req)}/auth/callback?token=${token}`);
    }
  );
} else {
  router.get("/google", (req, res) => {
    res.status(503).json({
      message:
        "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your backend environment variables / .env file.",
    });
  });

  router.get("/google/callback", (req, res) => {
    res.status(503).json({
      message:
        "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your backend environment variables / .env file.",
    });
  });
}

module.exports = router;
