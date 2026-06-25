const express = require("express");
const { body } = require("express-validator");
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validateMiddleware");

const router = express.Router();

router.get("/", protect, requireRole("admin"), userController.listUsers);

router.get(
  "/pending-teachers",
  protect,
  requireRole("admin"),
  userController.listPendingTeachers
);

router.patch(
  "/:userId/approve-teacher",
  protect,
  requireRole("admin"),
  userController.approveTeacher
);

router.patch(
  "/:userId/reject-teacher",
  protect,
  requireRole("admin"),
  userController.rejectTeacher
);

router.patch(
  "/:userId/status",
  protect,
  requireRole("admin"),
  [body("status").isIn(["active", "inactive", "pending"]).withMessage("status must be active, inactive, or pending")],
  validate,
  userController.updateUserStatus
);

module.exports = router;
