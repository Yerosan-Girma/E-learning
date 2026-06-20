const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const ApiError = require("../utils/ApiError");
const notificationModel = require("../models/notificationModel");

const getMyNotifications = asyncHandler(async (req, res) => {
  const { limit, unreadOnly } = req.query;
  const notifications = await notificationModel.getNotificationsByUser(req.user.id, {
    limit: limit ? parseInt(limit) : 20,
    unreadOnly: unreadOnly === "true",
  });

  const unreadCount = await notificationModel.getUnreadCount(req.user.id);

  return sendSuccess(
    res,
    {
      notifications,
      unreadCount,
    },
    "Notifications fetched"
  );
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notificationId = Number(req.params.notificationId);

  // Verify notification belongs to user
  const notification = await notificationModel.getNotificationById(notificationId);
  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.user_id !== req.user.id) {
    throw new ApiError(403, "Access denied");
  }

  await notificationModel.markAsRead(notificationId);

  return sendSuccess(res, { notificationId }, "Notification marked as read");
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const rowCount = await notificationModel.markAllAsRead(req.user.id);

  return sendSuccess(
    res,
    {
      markedCount: rowCount,
    },
    "All notifications marked as read"
  );
});

const deleteNotification = asyncHandler(async (req, res) => {
  const notificationId = Number(req.params.notificationId);

  // Verify notification belongs to user
  const notification = await notificationModel.getNotificationById(notificationId);
  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.user_id !== req.user.id) {
    throw new ApiError(403, "Access denied");
  }

  await notificationModel.deleteNotification(notificationId);

  return sendSuccess(res, { notificationId }, "Notification deleted");
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationModel.getUnreadCount(req.user.id);

  return sendSuccess(res, { unreadCount: count }, "Unread count fetched");
});

module.exports = {
  getMyNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};
