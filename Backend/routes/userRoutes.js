const express = require("express");
const { body } = require("express-validator");
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validateMiddleware");

const router = express.Router();

router.get("/", protect, requireRole("admin"), userController.listUsers);

router.patch(
  "/:userId/status",
  protect,
  requireRole("admin"),
  [body("status").isIn(["active", "inactive"]).withMessage("status must be active or inactive")],
  validate,
  userController.updateUserStatus
);

module.exports = router;
