const express = require("express");
const { body } = require("express-validator");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const { validate } = require("../middleware/validateMiddleware");
const emailService = require("../services/emailService");

const router = express.Router();

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Your name is required"),
    body("email").isEmail().withMessage("A valid email address is required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
    body("subject").optional().trim(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { name, email, subject, message, newsletter } = req.body;

    // 1. Send inquiry to Admin's email (admin@edulearn.com)
    emailService
      .sendContactFormEmail({ name, email, subject, message })
      .catch((err) => console.error("[ContactRoutes] Admin contact email error:", err.message));

    // 2. Send acknowledgment confirmation to the visitor
    emailService
      .sendContactAcknowledgmentEmail({ name, email, subject })
      .catch((err) => console.error("[ContactRoutes] Acknowledgment email error:", err.message));

    return sendSuccess(
      res,
      { received: true },
      "Thank you for contacting EduLearn! Your message has been received and our team will get back to you soon."
    );
  })
);

module.exports = router;
