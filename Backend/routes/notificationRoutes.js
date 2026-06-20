const express = require("express");
const router = express.Router();
const {
  getMyNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} = require("../controllers/notificationController");
const { authenticate } = require("../middleware/authMiddleware");

// All notification routes require authentication
router.use(authenticate);

router.get("/", getMyNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/:notificationId/read", markNotificationAsRead);
router.put("/read-all", markAllAsRead);
router.delete("/:notificationId", deleteNotification);

module.exports = router;
