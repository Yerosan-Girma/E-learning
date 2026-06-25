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

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      // Successful authentication, generate JWT token
      const { signToken } = require("../utils/jwt");
      const token = signToken({ id: req.user.id, role: req.user.role, email: req.user.email, full_name: req.user.full_name });
      
      // Redirect to frontend callback handler with token
      res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:5173'}/auth/callback?token=${token}`);
    }
  );
} else {
  router.get("/google", (req, res) => {
    res.status(503).json({ message: "Google OAuth is not configured" });
  });
  
  router.get("/google/callback", (req, res) => {
    res.status(503).json({ message: "Google OAuth is not configured" });
  });
}

module.exports = router;
