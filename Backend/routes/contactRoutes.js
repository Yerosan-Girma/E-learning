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

    console.log(`[ContactRoutes] Incoming contact inquiry from: ${name} <${email}>, Subject: "${subject || "General"}"`);

    // Await both notifications to ensure reliable delivery before completing the HTTP cycle
    const results = await Promise.allSettled([
      emailService.sendContactFormEmail({ name, email, subject, message }),
      emailService.sendContactAcknowledgmentEmail({ name, email, subject }),
    ]);

    const adminResult = results[0];
    const visitorResult = results[1];

    if (adminResult.status === "rejected" || (adminResult.value && !adminResult.value.success)) {
      console.error("[ContactRoutes] Admin inquiry email delivery warning:", adminResult.reason || adminResult.value?.error);
    } else {
      console.log("[ContactRoutes] Admin inquiry email delivered successfully to admin.");
    }

    if (visitorResult.status === "rejected" || (visitorResult.value && !visitorResult.value.success)) {
      console.error("[ContactRoutes] Visitor acknowledgment email delivery warning:", visitorResult.reason || visitorResult.value?.error);
    } else {
      console.log("[ContactRoutes] Acknowledgment email delivered to visitor.");
    }

    return sendSuccess(
      res,
      { received: true },
      "Thank you for contacting EduLearn! Your message has been received and our team will get back to you soon."
    );
  })
);

module.exports = router;

