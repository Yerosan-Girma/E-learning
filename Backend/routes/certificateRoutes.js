const express = require("express");
const router = express.Router();
const {
  generateCertificate,
  getMyCertificates,
  getCertificateByNumber,
  verifyCertificate,
  getCourseCertificates,
} = require("../controllers/certificateController");
const { authenticate } = require("../middleware/authMiddleware");

// Public routes for verification
router.get("/verify/:verificationCode", verifyCertificate);
router.get("/number/:certificateNumber", getCertificateByNumber);

// Protected routes
router.use(authenticate);

router.get("/my", getMyCertificates);
router.post("/courses/:courseId/generate", generateCertificate);
router.get("/courses/:courseId", getCourseCertificates);

module.exports = router;
