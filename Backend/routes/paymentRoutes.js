const express = require("express");
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { uploadPaymentProof } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
  "/courses/:courseId/initialize",
  protect,
  requireRole("student"),
  paymentController.initializeCoursePayment
);

router.post(
  "/courses/:courseId/manual-proof",
  protect,
  requireRole("student"),
  uploadPaymentProof.single("screenshot"),
  paymentController.submitManualPaymentProof
);

router.post("/webhook", paymentController.handlePaymentWebhook);
router.get("/me", protect, paymentController.getMyPayments);
router.get("/", protect, requireRole("admin"), paymentController.listAllPayments);

module.exports = router;
