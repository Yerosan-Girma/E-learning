const express = require("express");
const enrollmentController = require("../controllers/enrollmentController");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/:courseId", protect, requireRole("student"), enrollmentController.enrollInCourse);
router.get("/me/list", protect, requireRole("student"), enrollmentController.getMyEnrollments);
router.get("/", protect, requireRole("admin"), enrollmentController.listAllEnrollments);
router.patch(
  "/:enrollmentId/status",
  protect,
  requireRole("admin"),
  enrollmentController.approveOrRejectEnrollment
);

module.exports = router;
