const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/student", protect, requireRole("student"), dashboardController.getStudentDashboard);
router.get("/teacher", protect, requireRole("teacher"), dashboardController.getTeacherDashboard);
router.get("/admin", protect, requireRole("admin"), dashboardController.getAdminDashboard);

module.exports = router;
